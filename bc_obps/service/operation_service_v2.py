from typing import List, Optional
from django.db.models import QuerySet
from registration.models.document_type import DocumentType
from registration.models.facility_designated_operation_timeline import FacilityDesignatedOperationTimeline
from registration.constants import UNAUTHORIZED_MESSAGE
from registration.models.address import Address
from registration.models.contact import Contact
from registration.models.multiple_operator import MultipleOperator
from registration.schema.v2.multiple_operator import MultipleOperatorIn
from service.data_access_service.address_service import AddressDataAccessService
from service.data_access_service.multiple_operator_service import MultipleOperatorService
from registration.models.user_operator import UserOperator
from registration.models import Operation
from ninja import Query
from django.db import transaction
from service.data_access_service.document_service import DocumentDataAccessService
from service.data_access_service.operation_service_v2 import OperationDataAccessServiceV2
from service.document_service import DocumentService
from service.data_access_service.operation_service import OperationDataAccessService
from service.data_access_service.user_service import UserDataAccessService
from uuid import UUID
from registration.models.opted_in_operation_detail import OptedInOperationDetail
from service.data_access_service.opted_in_operation_detail_service import OptedInOperationDataAccessService
from service.operation_service import OperationService
from registration.models.registration_purpose import RegistrationPurpose
from service.data_access_service.registration_purpose_service import RegistrationPurposeDataAccessService
from registration.schema.v2.operation import (
    OperationFilterSchema,
    OperationInformationIn,
    OptedInOperationDetailIn,
    OperationStatutoryDeclarationIn,
    RegistrationPurposeIn,
)
from registration.utils import files_have_same_hash
from service.contact_service import ContactService
from registration.schema.v2.operation import OperationRepresentativeIn
from django.db.models import Q

    
class OperationServiceV2:
    @classmethod
    def list_operations(
        cls,
        user_guid: UUID,
        sort_field: Optional[str],
        sort_order: Optional[str],
        filters: OperationFilterSchema = Query(...),
    ) -> QuerySet[Operation]:
        user = UserDataAccessService.get_by_guid(user_guid)
        sort_direction = "-" if sort_order == "desc" else ""
        sort_by = f"{sort_direction}{sort_field}"
        base_qs = OperationDataAccessServiceV2.get_all_operations_for_user(user)
        return filters.filter(base_qs).order_by(sort_by)

    @classmethod
    def list_current_users_unregistered_operations(
        cls,
        user_guid: UUID,
    ) -> QuerySet[Operation]:
        user = UserDataAccessService.get_by_guid(user_guid)
        return OperationDataAccessService.get_all_operations_for_user(user).filter(
            ~Q(status=Operation.Statuses.REGISTERED)
        )

    @classmethod
    @transaction.atomic()
    def set_registration_purpose(cls, user_guid: UUID, operation_id: UUID, payload: RegistrationPurposeIn) -> Operation:
        operation: Operation = OperationService.get_if_authorized(user_guid, operation_id)

        purpose_choice = next(
            (choice for choice in RegistrationPurpose.Purposes if choice.value == payload.registration_purpose), None
        )
        purposes: List[RegistrationPurpose.Purposes] = []
        # add the payload's purpose as long as it's not reporting or regulated (will add these later)
        if purpose_choice in [
            RegistrationPurpose.Purposes.ELECTRICITY_IMPORT_OPERATION,
            RegistrationPurpose.Purposes.POTENTIAL_REPORTING_OPERATION,
        ]:
            purposes.append(purpose_choice)
        else:
            reporting_and_regulated_purposes = [
                RegistrationPurpose.Purposes.OBPS_REGULATED_OPERATION,
                RegistrationPurpose.Purposes.REPORTING_OPERATION,
            ]
            if purpose_choice and purpose_choice not in reporting_and_regulated_purposes:
                reporting_and_regulated_purposes.append(purpose_choice)
            purposes.extend(reporting_and_regulated_purposes)
            if payload.regulated_products:
                operation.regulated_products.set(payload.regulated_products)

        for purpose in purposes:
            RegistrationPurposeDataAccessService.create_registration_purpose(
                user_guid, operation_id, {'registration_purpose': purpose}
            )
            if purpose == RegistrationPurpose.Purposes.OPTED_IN_OPERATION:
                operation.opted_in_operation = OptedInOperationDetail.objects.create(created_by_id=user_guid)
                operation.save(update_fields=['opted_in_operation'])
        operation.set_create_or_update(user_guid)
        return operation

    @classmethod
    @transaction.atomic()
    def update_status(cls, user_guid: UUID, operation_id: UUID, status: Operation.Statuses) -> Operation:
        operation = OperationService.get_if_authorized(user_guid, operation_id)
        operation.status = Operation.Statuses(status)
        operation.save(update_fields=['status'])
        operation.set_create_or_update(user_guid)
        return operation

    @classmethod
    @transaction.atomic()
    def update_opted_in_operation_detail(
        cls, user_guid: UUID, operation_id: UUID, payload: OptedInOperationDetailIn
    ) -> OptedInOperationDetail:
        operation = OperationService.get_if_authorized(user_guid, operation_id)
        if not operation.opted_in_operation:
            raise Exception("Operation does not have an opted-in operation.")
        return OptedInOperationDataAccessService.update_opted_in_operation_detail(
            user_guid, operation.opted_in_operation.id, payload.dict()
        )

    @classmethod
    def get_opted_in_operation_detail(cls, user_guid: UUID, operation_id: UUID) -> Optional[OptedInOperationDetail]:
        operation = OperationService.get_if_authorized(user_guid, operation_id)
        return operation.opted_in_operation

    @classmethod
    def create_or_replace_statutory_declaration(
        cls, user_guid: UUID, operation_id: UUID, payload: OperationStatutoryDeclarationIn
    ) -> Operation:
        existing_statutory_document = DocumentService.get_existing_statutory_declaration_by_operation_id(operation_id)
        operation = OperationDataAccessService.get_by_id(operation_id)

        # industry users can only edit operations that belong to their operator
        if not operation.user_has_access(user_guid):
            raise Exception(UNAUTHORIZED_MESSAGE)

        # if there is an existing statutory declaration document, check if the new one is different
        if existing_statutory_document:
            # We need to check if the file has changed, if it has, we need to delete the old one and create a new one
            if not files_have_same_hash(payload.statutory_declaration, existing_statutory_document.file):  # type: ignore[arg-type] # mypy is not aware of the schema validator
                existing_statutory_document.delete()
            else:
                return operation
        # if there is no existing statutory declaration document, create a new one
        document = DocumentDataAccessService.create_document(
            user_guid, payload.statutory_declaration, "signed_statutory_declaration"  # type: ignore[arg-type] # mypy is not aware of the schema validator
        )
        if document:
            operation.documents.set([document])
        operation.set_create_or_update(user_guid)
        return operation

    @classmethod
    @transaction.atomic()
    def create_operation_representative(
        cls, user_guid: UUID, operation_id: UUID, payload: OperationRepresentativeIn
    ) -> Contact:
        operation: Operation = OperationService.get_if_authorized(user_guid, operation_id)
        existing_contact_id = payload.existing_contact_id
        if existing_contact_id:
            # We need to prevent users from updating the contact's first name, last name, and email if they are using an existing contact
            # This is already handled in the schema, but we need to make sure it's enforced here as well
            contact: Contact = Contact.objects.get(id=existing_contact_id)
            if any(
                [
                    payload.first_name != contact.first_name,  # type: ignore[attr-defined]
                    payload.last_name != contact.last_name,  # type: ignore[attr-defined]
                    payload.email != contact.email,  # type: ignore[attr-defined]
                ]
            ):
                raise Exception("Cannot update first name, last name, or email of existing contact.")
            contact = ContactService.update_contact(user_guid, existing_contact_id, payload)
        else:
            contact = ContactService.create_contact(user_guid, payload)
        operation.contacts.add(contact)
        operation.set_create_or_update(user_guid)
        return contact

    @classmethod
    @transaction.atomic()
    def create_or_update_operation_v2(
        cls,
        user_guid: UUID,
        payload: OperationInformationIn,
        operation_id: UUID | None = None,
    ) -> Operation:
        user_operator: UserOperator = UserDataAccessService.get_user_operator_by_user(user_guid)

        operation_data = payload.dict(
            include={
                'name',
                "type",
                "naics_code_id",
                'secondary_naics_code_id',
                'tertiary_naics_code_id',
            }
        )
        operation_data['operator_id'] = user_operator.operator_id
        if operation_id:
            operation_data['pk'] = operation_id

        operation: Operation
        operation, _ = Operation.custom_update_or_create(Operation, user_guid, **operation_data)

        # set m2m relationships
        operation.activities.set(payload.activities)

        boundary_map = DocumentService.create_or_replace_operation_document(user_guid, operation.id, payload.boundary_map, 'boundary_map')  # type: ignore # mypy is not aware of the schema validator

        process_flow_diagram = DocumentService.create_or_replace_operation_document(
            user_guid, operation.id, payload.process_flow_diagram, 'process_flow_diagram'  # type: ignore # mypy is not aware of the schema validator
        )
        equipment_list = DocumentService.create_or_replace_operation_document(
            user_guid, operation.id, payload.equipment_list, 'equipment_list'  # type: ignore # mypy is not aware of the schema validator
        )

        operation.documents.set([boundary_map, process_flow_diagram, equipment_list])

        # handle multiple operators
        multiple_operators_data = payload.multiple_operators_array
        cls.upsert_multiple_operators(operation, multiple_operators_data, user_guid)

        return operation

    @classmethod
    @transaction.atomic()
    def register_operation_information(
        cls, user_guid: UUID, operation_id: UUID | None, payload: OperationInformationIn
    ) -> Operation:
        if operation_id:
            existing_operation = OperationDataAccessService.get_by_id(operation_id)

            if not existing_operation.user_has_access(user_guid):
                raise Exception(UNAUTHORIZED_MESSAGE)

        operation: Operation = cls.create_or_update_operation_v2(
            user_guid,
            payload,
            operation_id,
        )

        registration_payload = RegistrationPurposeIn(
            registration_purpose=payload.registration_purpose, regulated_products=payload.regulated_products
        )
        cls.set_registration_purpose(user_guid, operation.id, registration_payload)

        return operation

    @classmethod
    @transaction.atomic()
    def upsert_multiple_operators(
        cls, operation: Operation, multiple_operators_data: list[MultipleOperatorIn] | None, user_guid: UUID
    ) -> None:
        old_multiple_operators: QuerySet[MultipleOperator] = operation.multiple_operators.all()
        # if all multiple operators have been removed, archive them
        if not multiple_operators_data:
            for old_multiple in old_multiple_operators:
                old_multiple.set_archive(user_guid)
            return

        new_multiple_operators = []
        for mo_data in multiple_operators_data:
            mo_operator_data: dict = mo_data.dict(
                include={
                    'legal_name',
                    'trade_name',
                    'business_structure',
                    'cra_business_number',
                    'bc_corporate_registry_number',
                }
            )
            old_address_id = mo_data.attorney_address if hasattr(mo_data, 'attorney_address') else None
            new_address = mo_data.dict(
                include={'street_address', 'municipality', 'province', 'postal_code'}, exclude_none=True
            )
            if old_address_id and not new_address:
                old_address = Address.objects.get(id=old_address_id)
                mo_operator_data['attorney_address'] = None
                old_address.delete()

            if new_address:
                updated_attorney_address = AddressDataAccessService.upsert_address_from_data(
                    new_address, old_address_id
                )
                mo_operator_data['attorney_address'] = updated_attorney_address

            new_multiple_operators.append(
                MultipleOperatorService.create_or_update(mo_data.id, operation, user_guid, mo_operator_data)
            )

        for old_multiple in old_multiple_operators:
            if old_multiple not in new_multiple_operators:
                old_multiple.set_archive(user_guid)

    @classmethod
    @transaction.atomic()
    def update_operation(
        cls,
        user_guid: UUID,
        payload: OperationInformationIn,
        operation_id: UUID,
    ) -> Operation:
        OperationService.get_if_authorized(user_guid, operation_id)

        operation: Operation = cls.create_or_update_operation_v2(
            user_guid,
            payload,
            operation_id,
        )

        if payload.regulated_products:
            # We should add a conditional to check registration_purpose type here
            # At the time of implementation there are some changes to registration_purpose coming from the business area
            operation.regulated_products.set(payload.regulated_products)
            operation.set_create_or_update(user_guid)
        return operation
    
    @classmethod
    def raise_exception_if_operation_is_missing_registration_data(cls, operation_id):
        operation = OperationDataAccessService.get_by_id(operation_id)

        # has a registration purpose
        if not operation.registration_purposes.exists():
            raise Exception('missing purpose')

        # must have at least one operation rep with a complete address
        if (
            not operation.contacts.all()
            .filter(
                business_role__role_name='Operation Representative',
                address__street_address__isnull=False,
                address__municipality__isnull=False,
                address__province__isnull=False,
                address__postal_code__isnull=False,
            )
            .exists()
        ):
            raise Exception('missing op rep')

        # operation must have at least one facility
        if not FacilityDesignatedOperationTimeline.objects.filter(operation=operation).exists():
            raise Exception('missing facility')

        # operation must have at least one reporting activity
        if not operation.activities.exists():
            raise Exception('missing activities')

        # operation needs attachments
        if not operation.documents.filter(
            type__in=[
                DocumentType.objects.get(name='process_flow_diagram'),
                DocumentType.objects.get(name='boundary_map'),
            ]
        ).exists():
            raise Exception('missing docs')

        # if operation is a new entrant, it must have statutory declaration
        if operation.registration_purposes.filter(
            registration_purpose=RegistrationPurpose.Purposes.NEW_ENTRANT_OPERATION
        ).exists():
            if not operation.documents.filter(type=DocumentType.objects.get(name='signed_statutory_declaration')).exists():
                raise Exception('missing new entrant')

        # if operation is an opt-in, it must have all questions answered
        if operation.registration_purposes.filter(
            registration_purpose=RegistrationPurpose.Purposes.OPTED_IN_OPERATION
        ).exists():
            # if the operation doesn't have a fk to an opted_in_operation record raise exception
            if not operation.opted_in_operation:

                raise Exception('missing opt in')
            # if any of the fields in the opted_in_operation record are blank, raise exception
            fields_to_check = [
                'meets_section_3_emissions_requirements',
                'meets_electricity_import_operation_criteria',
                'meets_entire_operation_requirements',
                'meets_section_6_emissions_requirements',
                'meets_naics_code_11_22_562_classification_requirements',
                'meets_producing_gger_schedule_a1_regulated_product',
                'meets_reporting_and_regulated_obligations',
                'meets_notification_to_director_on_criteria_change',
            ]
            for field in fields_to_check:
                if getattr(operation.opted_in_operation, field) is None:
                    raise Exception('missing opt in detail')
