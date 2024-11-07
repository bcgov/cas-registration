from typing import List, Optional, Tuple, Callable, Generator
from django.db.models import QuerySet
from registration.models.bc_greenhouse_gas_id import BcGreenhouseGasId
from registration.models.user import User
from registration.models.bc_obps_regulated_operation import BcObpsRegulatedOperation
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
    OperationRepresentativeRemove,
    OptedInOperationDetailIn,
    OperationNewEntrantApplicationIn,
    RegistrationPurposeIn,
)
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
                operation.opt_in = True
                operation.save(update_fields=['opted_in_operation', 'opt_in'])
        operation.set_create_or_update(user_guid)
        return operation

    @classmethod
    @transaction.atomic()
    def update_status(cls, user_guid: UUID, operation_id: UUID, status: Operation.Statuses) -> Operation:
        operation = OperationService.get_if_authorized(user_guid, operation_id)
        if status == Operation.Statuses.REGISTERED:
            cls.raise_exception_if_operation_missing_registration_information(operation)
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
    def create_or_replace_new_entrant_application(
        cls, user_guid: UUID, operation_id: UUID, payload: OperationNewEntrantApplicationIn
    ) -> Operation:
        operation = OperationDataAccessService.get_by_id(operation_id)

        # industry users can only edit operations that belong to their operator
        if not operation.user_has_access(user_guid):
            raise Exception(UNAUTHORIZED_MESSAGE)

        (
            new_entrant_application_document,
            new_entrant_application_document_created,
        ) = DocumentService.create_or_replace_operation_document(
            user_guid,
            operation_id,
            payload.new_entrant_application,  # type: ignore # mypy is not aware of the schema validator
            "new_entrant_application",
        )
        if new_entrant_application_document_created:
            operation.documents.add(new_entrant_application_document)
        operation.date_of_first_shipment = payload.date_of_first_shipment
        operation.save(update_fields=['date_of_first_shipment'])
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
    def remove_operation_representative(
        cls, user_guid: UUID, operation_id: UUID, payload: OperationRepresentativeRemove
    ) -> OperationRepresentativeRemove:
        operation: Operation = OperationService.get_if_authorized(user_guid, operation_id)
        operation.contacts.remove(payload.id)
        operation.set_create_or_update(user_guid)
        return OperationRepresentativeRemove(id=payload.id)

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
                'type',
                'naics_code_id',
                'secondary_naics_code_id',
                'tertiary_naics_code_id',
                'date_of_first_shipment',
            }
        )
        operation_data['operator_id'] = user_operator.operator_id
        if operation_id:
            operation_data['pk'] = operation_id

        operation: Operation
        operation, _ = Operation.custom_update_or_create(Operation, user_guid, **operation_data)

        # set m2m relationships
        operation.activities.set(payload.activities)

        # create or replace documents
        operation_documents = [
            doc
            for doc, created in [
                DocumentService.create_or_replace_operation_document(
                    user_guid,
                    operation.id,
                    payload.boundary_map,  # type: ignore # mypy is not aware of the schema validator
                    'boundary_map',
                ),
                DocumentService.create_or_replace_operation_document(
                    user_guid,
                    operation.id,
                    payload.process_flow_diagram,  # type: ignore # mypy is not aware of the schema validator
                    'process_flow_diagram',
                ),
                *(
                    [
                        DocumentService.create_or_replace_operation_document(
                            user_guid,
                            operation.id,
                            payload.new_entrant_application,  # type: ignore # mypy is not aware of the schema validator
                            'new_entrant_application',
                        )
                    ]
                    if payload.new_entrant_application
                    else []
                ),
            ]
            if created
        ]
        operation.documents.add(*operation_documents)

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
        cls.update_status(user_guid, operation.id, Operation.Statuses.DRAFT)

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
    def is_operation_opt_in_information_complete(cls, operation: Operation) -> bool:
        """
        This function checks if all opt-in information is complete.
        Complete means an operation has both a FK to the opt-in detail, and the details are complete.
        """
        opted_in_operation = operation.opted_in_operation
        if not opted_in_operation:
            return False

        required_fields = [
            'meets_section_3_emissions_requirements',
            'meets_electricity_import_operation_criteria',
            'meets_entire_operation_requirements',
            'meets_section_6_emissions_requirements',
            'meets_naics_code_11_22_562_classification_requirements',
            'meets_producing_gger_schedule_a1_regulated_product',
            'meets_reporting_and_regulated_obligations',
            'meets_notification_to_director_on_criteria_change',
        ]

        return all(getattr(opted_in_operation, field) is not None for field in required_fields)

    @classmethod
    def raise_exception_if_operation_missing_registration_information(cls, operation: Operation) -> None:
        """
        This function checks if the given operation instance has all necessary registration information.
        If any required information is missing, it raises an appropriate exception.
        """

        def check_conditions() -> Generator[Tuple[Callable[[], bool], str], None, None]:
            yield lambda: operation.registration_purposes.exists(), "Operation must have a registration purpose."
            yield (
                lambda: operation.contacts.filter(
                    business_role__role_name='Operation Representative',
                    address__street_address__isnull=False,
                    address__municipality__isnull=False,
                    address__province__isnull=False,
                    address__postal_code__isnull=False,
                ).exists(),
                "Operation must have an operation representative with an address.",
            )
            yield (
                lambda: FacilityDesignatedOperationTimeline.objects.filter(operation=operation).exists(),
                "Operation must have at least one facility.",
            )
            yield lambda: operation.activities.exists(), "Operation must have at least one reporting activity."

            # Check if the operation has both a process flow diagram and a boundary map
            yield (
                lambda: operation.documents.filter(Q(type__name='process_flow_diagram') | Q(type__name='boundary_map'))
                .distinct()
                .count()
                == 2,
                "Operation must have a process flow diagram and a boundary map.",
            )
            yield (
                lambda: not (
                    operation.registration_purposes.filter(
                        registration_purpose=RegistrationPurpose.Purposes.NEW_ENTRANT_OPERATION
                    ).exists()
                    and not operation.documents.filter(
                        type=DocumentType.objects.get(name='new_entrant_application')
                    ).exists()
                ),
                "Operation must have a signed statutory declaration if it is a new entrant.",
            )
            yield (
                lambda: not (
                    operation.registration_purposes.filter(
                        registration_purpose=RegistrationPurpose.Purposes.OPTED_IN_OPERATION
                    ).exists()
                    and not cls.is_operation_opt_in_information_complete(operation)
                ),
                "Operation must have completed opt-in information if it is opted in.",
            )

        for condition, error_message in check_conditions():
            if not condition():
                raise Exception(error_message)

    @classmethod
    def generate_boro_id(cls, user_guid: UUID, operation_id: UUID) -> Optional[BcObpsRegulatedOperation]:
        operation = OperationService.get_if_authorized(user_guid, operation_id)
        is_eio = operation.registration_purposes.filter(
            registration_purpose=RegistrationPurpose.Purposes.ELECTRICITY_IMPORT_OPERATION
        ).exists()
        if operation.bc_obps_regulated_operation:
            raise Exception('Operation already has a BORO ID.')
        if is_eio:
            raise Exception('EIOs cannot be issued BORO IDs.')
        if operation.status != Operation.Statuses.REGISTERED:
            raise Exception('Operations must be registered before they can be issued a BORO ID.')

        operation.generate_unique_boro_id()
        if operation.bc_obps_regulated_operation is None:
            raise Exception('Failed to create a BORO ID for the operation.')
        operation.bc_obps_regulated_operation.issued_by = User.objects.get(user_guid=user_guid)
        operation.bc_obps_regulated_operation.save()
        operation.save(update_fields=['bc_obps_regulated_operation'])

        return operation.bc_obps_regulated_operation

    @classmethod
    def generate_bcghg_id(cls, user_guid: UUID, operation_id: UUID) -> BcGreenhouseGasId:
        operation = OperationService.get_if_authorized(user_guid, operation_id)
        operation.generate_unique_bcghg_id()
        if operation.bcghg_id is None:
            raise Exception('Failed to create a BCGHG ID for the operation.')
        operation.bcghg_id.issued_by = User.objects.get(user_guid=user_guid)
        operation.bcghg_id.save()
        operation.save(update_fields=['bcghg_id'])

        return operation.bcghg_id
