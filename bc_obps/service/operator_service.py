import pytz
from service.data_access_service.user_operator_service import UserOperatorDataAccessService
from registration.models import ParentOperator
from typing import List, Optional, Union
from datetime import datetime

from service.data_access_service.operator_service import OperatorDataAccessService

from registration.schema import OperatorSearchOut
from registration.models import Operator, UserOperator
from uuid import UUID


from registration.models import Operator, UserOperator, User

from registration.schema import OperatorIn
from django.db import transaction
from registration.utils import (
    set_verification_columns,
)


class OperatorService:
    @classmethod
    def get_operators_by_cra_number_or_legal_name(
        cls, cra_business_number: Optional[int] = None, legal_name: Optional[str] = ""
    ) -> Union[Operator, List[Operator]]:
        if not cra_business_number and not legal_name:
            raise Exception("No search value provided")
        if cra_business_number:
            try:
                operator = OperatorDataAccessService.get_operators_by_cra_number(cra_business_number)
                return OperatorSearchOut.model_validate(operator)
            except:
                raise Exception("No matching operator found. Retry or add operator.")
        elif legal_name:
            try:
                operators = OperatorDataAccessService.get_operators_by_legal_name(legal_name)
                return [OperatorSearchOut.model_validate(operator) for operator in operators]
            except:
                raise Exception("No matching operator found. Retry or add operator.")

    @classmethod
    def archive_parent_operators(
        cls,
        existing_parent_operators: List[ParentOperator],
        updated_parent_operators: List[ParentOperator],
        user_guid: UUID,
    ) -> None:
        updated_parent_operator_indices = [po.operator_index for po in updated_parent_operators if po.operator_index]

        existing_parent_operator_indices = [po.operator_index for po in existing_parent_operators if po.operator_index]

        indices_to_delete = list(set(existing_parent_operator_indices) - set(updated_parent_operator_indices))

        if indices_to_delete:
            parent_operators_to_delete: List[ParentOperator] = existing_parent_operators.filter(
                operator_index__in=indices_to_delete
            )
            for po in parent_operators_to_delete:
                po.set_archive(user_guid)

    @classmethod
    def assign_index(cls, existing_parent_operator_indices: List[int]) -> int:
        return (max(existing_parent_operator_indices) if existing_parent_operator_indices else 0) + 1

    @classmethod
    def handle_parent_operators(
        cls, updated_parent_operators: List[ParentOperator], operator_instance: Operator, user_guid: UUID
    ) -> None:
        existing_parent_operators = operator_instance.parent_operators.all()

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
                    po_operator.operator_index = cls.assign_index(existing_parent_operator_indices)
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
                po_operator_instance, _ = ParentOperator.objects.update_or_create(
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
                po_operator_instance.set_create_or_update(user_guid)

    @classmethod
    def update_operator_status(cls, user_guid: UUID, operator_id: UUID, updated_data: OperatorIn) -> Operator:
        operator = OperatorDataAccessService.get_operator_by_id(operator_id)
        with transaction.atomic():

            operator.status = updated_data.status
            if operator.is_new and operator.status == Operator.Statuses.DECLINED:
                # If the operator is new and declined, we need to decline all user operators tied to this operator
                UserOperator.objects.filter(operator_id=operator_id).update(
                    status=UserOperator.Statuses.DECLINED,
                    verified_at=datetime.now(pytz.utc),
                    verified_by=user_guid,
                )

            if operator.status in [Operator.Statuses.APPROVED, Operator.Statuses.DECLINED]:
                operator.is_new = False
                set_verification_columns(operator, user_guid)

            operator.save()
            operator.set_create_or_update(user_guid)
            return operator
