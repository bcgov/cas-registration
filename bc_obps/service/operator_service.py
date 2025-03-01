from registration.schema.v1.parent_operator import ParentOperatorIn
from service.email.email_service import EmailService
from registration.models import ParentOperator, User, Operator
from typing import List, Optional, Union
from django.db.models import QuerySet
from service.data_access_service.operator_service import OperatorDataAccessService
from registration.schema.v2.operator import OperatorSearchOut
from uuid import UUID
from registration.models import (
    Operation,
    BusinessStructure,
    MultipleOperator,
    Address,
)
from ninja.types import DictStrAny

email_service = EmailService()


class OperatorService:
    @classmethod
    def get_operators_by_cra_number_or_legal_name(
        cls, cra_business_number: Optional[int] = None, legal_name: Optional[str] = ""
    ) -> Union[Operator, QuerySet[Operator], OperatorSearchOut, List[OperatorSearchOut]]:
        if not cra_business_number and not legal_name:
            raise Exception("No search value provided")
        if cra_business_number:
            try:
                operator: Operator = OperatorDataAccessService.get_operators_by_cra_number(cra_business_number)
                return OperatorSearchOut.model_validate(operator)
            except Exception:
                raise Exception("No matching operator found. Retry or add operator.")
        elif legal_name:
            try:
                operators: QuerySet[Operator] = OperatorDataAccessService.get_operators_by_legal_name(legal_name)
                return [OperatorSearchOut.model_validate(operator) for operator in operators]
            except Exception:
                raise Exception("No matching operator found. Retry or add operator.")
        return []

    @classmethod
    def archive_parent_operators(
        cls,
        existing_parent_operators: QuerySet[ParentOperator],
        updated_parent_operators: List[ParentOperatorIn],
        user_guid: UUID,
    ) -> None:
        updated_parent_operator_indices = [po.operator_index for po in updated_parent_operators if po.operator_index]

        existing_parent_operator_indices = [po.operator_index for po in existing_parent_operators if po.operator_index]

        indices_to_delete = list(set(existing_parent_operator_indices) - set(updated_parent_operator_indices))

        if indices_to_delete:
            parent_operators_to_delete: QuerySet[ParentOperator] = existing_parent_operators.filter(
                operator_index__in=indices_to_delete
            )
            for po in parent_operators_to_delete:
                po.set_archive(user_guid)

    @classmethod
    def assign_index(cls, existing_parent_operator_indices: List[int]) -> int:
        return (max(existing_parent_operator_indices) if existing_parent_operator_indices else 0) + 1

    @classmethod
    def handle_parent_operators(
        cls, updated_parent_operators: Optional[List[ParentOperatorIn]], operator_instance: Operator, user_guid: UUID
    ) -> None:
        existing_parent_operators: QuerySet[ParentOperator] = operator_instance.parent_operators.all()

        # if the user has removed all parent operators, archive them all
        if not updated_parent_operators and existing_parent_operators:
            for po in existing_parent_operators:
                po.set_archive(user_guid)
            return

        existing_parent_operator_indices = list(existing_parent_operators.values_list('operator_index', flat=True))
        # if the user has added, edited, or removed some parent operators
        if updated_parent_operators:
            for po_operator in updated_parent_operators:
                # archive any parent operators that have been removed
                if existing_parent_operator_indices:
                    cls.archive_parent_operators(existing_parent_operators, updated_parent_operators, user_guid)
                # assign an operator_index to new parent operators
                if not po_operator.operator_index:
                    po_operator.operator_index = cls.assign_index(existing_parent_operator_indices)  # type: ignore[arg-type]
                    existing_parent_operator_indices.append(po_operator.operator_index)

                # handle addresses
                existing_po_physical_address = ParentOperator.objects.filter(
                    child_operator_id=operator_instance.id, operator_index=po_operator.operator_index
                ).first()
                existing_po_physical_address_id = (
                    existing_po_physical_address.physical_address_id if existing_po_physical_address else None
                )

                existing_po_mailing_address = ParentOperator.objects.filter(
                    child_operator_id=operator_instance.id, operator_index=po_operator.operator_index
                ).first()
                existing_po_mailing_address_id = (
                    existing_po_mailing_address.mailing_address_id if existing_po_mailing_address else None
                )
                from service.addresses_service import AddressesService

                physical_address, mailing_address = AddressesService.upsert_addresses_from_data(
                    po_operator.dict(), existing_po_physical_address_id, existing_po_mailing_address_id, 'po_'
                ).values()

                # create or update the parent operator
                ParentOperator.objects.update_or_create(
                    child_operator=operator_instance,
                    operator_index=po_operator.operator_index,
                    defaults={
                        "legal_name": po_operator.po_legal_name,
                        "trade_name": po_operator.po_trade_name,
                        "cra_business_number": po_operator.po_cra_business_number,
                        "bc_corporate_registry_number": po_operator.po_bc_corporate_registry_number,
                        "business_structure": po_operator.po_business_structure,
                        "website": po_operator.po_website,
                        "physical_address": physical_address,
                        "mailing_address": mailing_address,
                    },
                )

    # Function to save multiple operators so we can reuse it in put/post routes
    @classmethod
    def create_or_update_multiple_operators(
        cls, multiple_operators_array: List[DictStrAny], operation: Operation, user: User
    ) -> None:
        """
        Creates or updates multiple operators associated with a specific operation.

        Description:
        This function processes an array of MultipleOperator objects, associating them with a specific operation.
        It creates new operators if they do not exist or updates existing ones if found, based on the provided details.

        Note:
        - Addresses are handled: If no mailing address is given, the physical address is considered the mailing address.
        """
        multiple_operator_fields_mapping = {
            "mo_legal_name": "legal_name",
            "mo_trade_name": "trade_name",
            "mo_cra_business_number": "cra_business_number",
            "mo_bc_corporate_registry_number": "bc_corporate_registry_number",
            "mo_business_structure": "business_structure",
            "mo_website": "website",
            "mo_percentage_ownership": "percentage_ownership",
            "mo_mailing_address_same_as_physical": "mailing_address_same_as_physical",
        }
        for idx, operator in enumerate(multiple_operators_array):
            new_operator = {
                "operation_id": operation.id,
                "operator_index": idx + 1,
            }
            # This will create a new address every time instead of updating, fix if multiple operators if re-added
            # handle addresses--if there's no mailing address given, it's the same as the physical address
            physical_address = Address.objects.create(
                street_address=operator.get("mo_physical_street_address"),
                municipality=operator.get("mo_physical_municipality"),
                province=operator.get("mo_physical_province"),
                postal_code=operator.get("mo_physical_postal_code"),
            )

            new_operator["physical_address_id"] = physical_address.id

            if operator.get("mo_mailing_address_same_as_physical"):
                new_operator["mailing_address_id"] = physical_address.id
            else:
                mailing_address = Address.objects.create(
                    street_address=operator.get("mo_mailing_street_address"),
                    municipality=operator.get("mo_mailing_municipality"),
                    province=operator.get("mo_mailing_province"),
                    postal_code=operator.get("mo_mailing_postal_code"),
                )
                new_operator["mailing_address_id"] = mailing_address.id

            for field in operator:
                if field in multiple_operator_fields_mapping:
                    new_operator[multiple_operator_fields_mapping[field]] = operator[field]

            new_operator["business_structure"] = BusinessStructure.objects.get(
                name=operator.get("mo_business_structure")
            )
            # TODO: archive multiple operators in #361 that are not in the array anymore once #326 is done

            # check if there is a multiple_operator with that operation id and number
            # if there is, update it, if not, create it
            MultipleOperator.objects.update_or_create(
                operation_id=operation.id, operator_index=idx + 1, defaults={**new_operator}
            )
