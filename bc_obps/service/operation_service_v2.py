from typing import List, Optional, Tuple, Callable, Generator, Union
from django.db.models import QuerySet
from registration.models.facility import Facility
from registration.schema.v1.facility import FacilityIn
from registration.schema.v2.operation_timeline import OperationTimelineFilterSchema
from service.contact_service_v2 import ContactServiceV2
from service.data_access_service.document_service_v2 import DocumentDataAccessServiceV2
from service.data_access_service.operation_designated_operator_timeline_service import (
    OperationDesignatedOperatorTimelineDataAccessService,
)
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
from service.document_service_v2 import DocumentServiceV2
from service.facility_service import FacilityService
from service.operation_service import OperationService
from registration.schema.v2.operation import (
    OperationInformationIn,
    OperationInformationInUpdate,
    OperationRepresentativeRemove,
    OptedInOperationDetailIn,
    OperationNewEntrantApplicationIn,
)
from registration.schema.v2.operation import OperationRepresentativeIn
from django.db.models import Q
from datetime import datetime
from zoneinfo import ZoneInfo
from registration.models.operation_designated_operator_timeline import OperationDesignatedOperatorTimeline


class OperationServiceV2:
    @classmethod
    def get_if_authorized_v2(
        cls,
        user_guid: UUID,
        operation_id: UUID,
        only_fields: Optional[List[str]] = None,
    ) -> Operation:
        operation: Operation
        if only_fields:
            operation = Operation.objects.only(*only_fields).get(id=operation_id)
        else:
            operation = OperationDataAccessServiceV2.get_by_id(operation_id)
        user: User = UserDataAccessService.get_by_guid(user_guid)
        if user.is_industry_user():

            if not operation.user_has_access(user.user_guid):
                raise Exception(UNAUTHORIZED_MESSAGE)
            return operation
        return operation

    @classmethod
    def list_operations_timeline(
        cls,
        user_guid: UUID,
        sort_field: Optional[str],
        sort_order: Optional[str],
        filters: OperationTimelineFilterSchema = Query(...),
    ) -> QuerySet[OperationDesignatedOperatorTimeline]:
        user = UserDataAccessService.get_by_guid(user_guid)
        sort_direction = "-" if sort_order == "desc" else ""
        sort_by = f"{sort_direction}{sort_field}"
        base_qs = OperationDesignatedOperatorTimelineDataAccessService.get_operation_timeline_for_user(user)
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
    def update_status(cls, user_guid: UUID, operation_id: UUID, status: Operation.Statuses) -> Operation:
        # brianna don't use only_fields here--this function is often used in other functions that need more than the only_fields and then that triggers a query for every individual field
        operation = OperationServiceV2.get_if_authorized_v2(user_guid, operation_id)
        fields_to_update = ['status']
        if status == Operation.Statuses.REGISTERED:
            cls.raise_exception_if_operation_missing_registration_information(operation)
            operation.submission_date = datetime.now(ZoneInfo("UTC"))
            fields_to_update.append('submission_date')
        operation.status = Operation.Statuses(status)
        operation.save(update_fields=fields_to_update)
        return operation

    @classmethod
    @transaction.atomic()
    def update_opted_in_operation_detail(
        cls, user_guid: UUID, operation_id: UUID, payload: OptedInOperationDetailIn
    ) -> OptedInOperationDetail:
        operation = OperationServiceV2.get_if_authorized_v2(user_guid, operation_id, ['id', 'operator_id'])
        if not operation.opted_in_operation:
            raise Exception("Operation does not have an opted-in operation.")
        return OptedInOperationDataAccessService.update_opted_in_operation_detail(
            user_guid, operation.opted_in_operation.id, payload
        )

    @classmethod
    def get_opted_in_operation_detail(cls, user_guid: UUID, operation_id: UUID) -> Optional[OptedInOperationDetail]:
        operation = OperationServiceV2.get_if_authorized_v2(user_guid, operation_id, ['id', 'operator_id'])
        return operation.opted_in_operation

    @classmethod
    def create_or_replace_new_entrant_application(
        cls, user_guid: UUID, operation_id: UUID, payload: OperationNewEntrantApplicationIn
    ) -> Operation:
        operation = OperationServiceV2.get_if_authorized_v2(user_guid, operation_id, ['id', 'operator_id'])

        (
            new_entrant_application_document,
            new_entrant_application_document_created,
        ) = DocumentServiceV2.create_or_replace_operation_document(
            user_guid,
            operation_id,
            payload.new_entrant_application,  # type: ignore # mypy is not aware of the schema validator
            "new_entrant_application",
        )
        if new_entrant_application_document_created:
            operation.documents.add(new_entrant_application_document)
        operation.date_of_first_shipment = payload.date_of_first_shipment
        operation.save(update_fields=['date_of_first_shipment'])
        return operation

    @classmethod
    @transaction.atomic()
    def create_operation_representative(
        cls, user_guid: UUID, operation_id: UUID, payload: OperationRepresentativeIn
    ) -> Contact:
        operation: Operation = OperationServiceV2.get_if_authorized_v2(user_guid, operation_id, ['id', 'operator_id'])
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
            contact = ContactServiceV2.update_contact(user_guid, existing_contact_id, payload)
        else:
            contact = ContactServiceV2.create_contact(user_guid, payload)
        operation.contacts.add(contact)
        return contact

    @classmethod
    @transaction.atomic()
    def _create_or_update_eio(cls, user_guid: UUID, operation: Operation, payload: OperationInformationIn) -> None:
        # EIO operations have a facility with the same data as the operation
        eio_payload = FacilityIn(name=payload.name, type=Facility.Types.ELECTRICITY_IMPORT, operation_id=operation.id)
        facility = operation.facilities.first()
        if not facility:
            FacilityService.create_facilities_with_designated_operations(user_guid, [eio_payload])
        else:
            FacilityService.update_facility(user_guid, facility.id, eio_payload)

    @classmethod
    @transaction.atomic()
    def _create_opted_in_operation_detail(cls, user_guid: UUID, operation: Operation) -> Operation:
        """
        Creates an empty OptedInOperationDetail instance for the specified operation.
        This method is called before any opt-in data is available.
        """

        operation.opt_in = True
        operation.opted_in_operation = OptedInOperationDetail.objects.create(created_by_id=user_guid)
        operation.save(update_fields=['opted_in_operation', 'opt_in'])

        return operation

    @classmethod
    @transaction.atomic()
    def remove_operation_representative(
        cls, user_guid: UUID, operation_id: UUID, payload: OperationRepresentativeRemove
    ) -> OperationRepresentativeRemove:
        operation: Operation = OperationServiceV2.get_if_authorized_v2(user_guid, operation_id, ['id', 'operator_id'])
        operation.contacts.remove(payload.id)

        return OperationRepresentativeRemove(id=payload.id)

    @classmethod
    @transaction.atomic()
    def remove_opted_in_operation_detail(cls, user_guid: UUID, operation_id: UUID) -> Operation:
        operation: Operation = OperationService.get_if_authorized(user_guid, operation_id)
        operation.opt_in = False
        OptedInOperationDataAccessService.archive_or_delete_opted_in_operation_detail(user_guid, operation_id)
        operation.opted_in_operation = None
        operation.save(update_fields=['opt_in', 'opted_in_operation'])

        return operation

    @classmethod
    @transaction.atomic()
    def _create_operation_v2(
        cls,
        user_guid: UUID,
        payload: OperationInformationIn,
    ) -> Operation:

        operation_data = payload.dict(
            include={
                'name',
                'type',
                'naics_code_id',
                'secondary_naics_code_id',
                'tertiary_naics_code_id',
                'date_of_first_shipment',
                'registration_purpose',
                'opt_in',
            }
        )
        user_operator: UserOperator = UserDataAccessService.get_user_operator_by_user(user_guid)
        operation_data['operator_id'] = user_operator.operator_id

        operation = OperationDataAccessServiceV2.create_operation_v2(
            user_guid,
            operation_data,
            payload.activities if hasattr(payload, "activities") and payload.activities else [],
            payload.regulated_products if hasattr(payload, "regulated_products") and payload.regulated_products else [],
        )

        OperationDesignatedOperatorTimelineDataAccessService.create_operation_designated_operator_timeline(
            user_guid,
            {
                'operator': user_operator.operator,
                'operation': operation,
                'start_date': datetime.now(ZoneInfo("UTC")),
            },
        )

        # create documents
        operation_documents = [
            doc
            for doc in [
                *(
                    [
                        DocumentDataAccessServiceV2.create_document(
                            user_guid,
                            payload.boundary_map,  # type: ignore # mypy is not aware of the schema validator
                            'boundary_map',
                            operation.id,
                        )
                    ]
                    if payload.boundary_map
                    else []
                ),
                *(
                    [
                        DocumentDataAccessServiceV2.create_document(
                            user_guid,
                            payload.process_flow_diagram,  # type: ignore # mypy is not aware of the schema validator
                            'process_flow_diagram',
                            operation.id,
                        )
                    ]
                    if payload.process_flow_diagram
                    else []
                ),
                *(
                    DocumentDataAccessServiceV2.create_document(
                        user_guid,
                        payload.new_entrant_application,  # type: ignore # mypy is not aware of the schema validator
                        'new_entrant_application',
                        operation.id,
                    )
                    if payload.new_entrant_application
                    else []
                ),
            ]
        ]
        operation.documents.add(*operation_documents)

        # brianna this could just be create
        # handle multiple operators
        multiple_operators_data = payload.multiple_operators_array
        cls.upsert_multiple_operators(operation, multiple_operators_data, user_guid)

        # handle purposes
        if operation.registration_purpose == Operation.Purposes.OPTED_IN_OPERATION:
            operation = cls._create_opted_in_operation_detail(user_guid, operation)
        if operation.registration_purpose == Operation.Purposes.ELECTRICITY_IMPORT_OPERATION:
            cls._create_or_update_eio(user_guid, operation, payload)

        return operation

    @classmethod
    @transaction.atomic()
    def register_operation_information(
        cls,
        user_guid: UUID,
        operation_id: UUID | None,
        payload: Union[OperationInformationIn, OperationInformationInUpdate],
    ) -> Operation:

        # can't optimize this much more without looking at files--the extra hits to operation are in the middleware, and the multi hits to document are from the resolvers
        operation: Operation
        if operation_id:
            operation = OperationServiceV2.get_if_authorized_v2(user_guid, operation_id)
            cls.update_operation(user_guid, payload, operation_id)
        else:
            operation = cls._create_operation_v2(
                user_guid,
                payload,
            )
        if operation.status == Operation.Statuses.NOT_STARTED:
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

        # will need to retrieve operation as it exists currently in DB first, to determine whether there's been a change to the RP

        # brianna this seems to be called twice. If I comment out everything in the fuction except this service, I get 16 silk queries instead of 8
        operation: Operation = OperationServiceV2.get_if_authorized_v2(
            user_guid,
            operation_id,
        )

        if payload.registration_purpose != operation.registration_purpose:
            payload = cls.handle_change_of_registration_purpose(user_guid, operation, payload)

        operation_data = payload.dict(
            include={
                'name',
                'type',
                'naics_code_id',
                'secondary_naics_code_id',
                'tertiary_naics_code_id',
                'date_of_first_shipment',
                'registration_purpose',
                'opt_in',
            }
        )

        operation_data['pk'] = operation_id
        operation_data['operator_id'] = operation.operator.id

        operation, _ = Operation.custom_update_or_create(Operation, user_guid, **operation_data)

        operation.activities.set(payload.activities) if payload.activities else operation.activities.clear()

        (
            operation.regulated_products.set(payload.regulated_products)
            if payload.regulated_products
            else operation.regulated_products.clear()
        )  #  this is hitting some seemingly unrelated ones

        if operation.status == Operation.Statuses.REGISTERED and isinstance(payload, OperationInformationInUpdate):
            # operation representatives are only mandatory to register (vs. simply update) and operation
            for contact_id in payload.operation_representatives:
                ContactServiceV2.raise_exception_if_contact_missing_address_information(contact_id)

            operation.contacts.set(payload.operation_representatives)

        # create or replace documents
        operation_documents = [
            doc
            for doc, created in [
                *(
                    [
                        DocumentServiceV2.create_or_replace_operation_document(
                            user_guid,
                            operation.id,
                            payload.boundary_map,  # type: ignore # mypy is not aware of the schema validator
                            'boundary_map',
                        )
                    ]
                    if payload.boundary_map
                    else []
                ),
                *(
                    [
                        DocumentServiceV2.create_or_replace_operation_document(
                            user_guid,
                            operation.id,
                            payload.process_flow_diagram,  # type: ignore # mypy is not aware of the schema validator
                            'process_flow_diagram',
                        )
                    ]
                    if payload.process_flow_diagram
                    else []
                ),
                *(
                    [
                        DocumentServiceV2.create_or_replace_operation_document(
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
        # 41

        # # this is not handled by changing registration purpose
        if operation.registration_purpose == Operation.Purposes.OPTED_IN_OPERATION:
            operation = cls._create_opted_in_operation_detail(user_guid, operation)

        if operation.registration_purpose == Operation.Purposes.ELECTRICITY_IMPORT_OPERATION:
            cls._create_or_update_eio(user_guid, operation, payload)

        # # handle multiple operators
        multiple_operators_data = payload.multiple_operators_array
        cls.upsert_multiple_operators(operation, multiple_operators_data, user_guid)

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
    def is_operation_new_entrant_information_complete(cls, operation: Operation) -> bool:
        """
        This function checks whether the expected data for new-entrant operations has been saved.
        """
        if (
            operation.date_of_first_shipment is None
            or not operation.documents.filter(type=DocumentType.objects.get(name="new_entrant_application")).exists()
        ):
            return False
        return True

    @classmethod
    def raise_exception_if_operation_missing_registration_information(cls, operation: Operation) -> None:
        """
        This function checks if the given operation instance has all necessary registration information.
        If any required information is missing, it raises an appropriate exception.
        """

        def check_conditions() -> Generator[Tuple[Callable[[], bool], str], None, None]:
            yield lambda: operation.registration_purpose is not None, "Operation must have a registration purpose."
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
            # unless the registration purpose is Electricity Import Operation, the operation should have at least 1 reporting activity
            yield (
                lambda: not (
                    operation.registration_purpose != Operation.Purposes.ELECTRICITY_IMPORT_OPERATION
                    and not operation.activities.exists()
                ),
                "Operation must have at least one reporting activity.",
            )

            # Check if the operation has both a process flow diagram and a boundary map (unless it is an EIO)
            yield (
                lambda: not (
                    operation.registration_purpose != Operation.Purposes.ELECTRICITY_IMPORT_OPERATION
                    and operation.documents.filter(Q(type__name='process_flow_diagram') | Q(type__name='boundary_map'))
                    .distinct()
                    .count()
                    < 2
                ),
                "Operation must have a process flow diagram and a boundary map.",
            )
            yield (
                lambda: not (
                    operation.registration_purpose == Operation.Purposes.NEW_ENTRANT_OPERATION
                    and not cls.is_operation_new_entrant_information_complete(operation)
                ),
                "Operation must have a signed statutory declaration and date of first shipment if it is a new entrant.",
            )
            yield (
                lambda: not (
                    operation.registration_purpose == Operation.Purposes.OPTED_IN_OPERATION
                    and not cls.is_operation_opt_in_information_complete(operation)
                ),
                "Operation must have completed opt-in information if it is opted in.",
            )

        for condition, error_message in check_conditions():
            if not condition():
                raise Exception(error_message)

    @classmethod
    def generate_boro_id(cls, user_guid: UUID, operation_id: UUID) -> Optional[BcObpsRegulatedOperation]:
        # This service is only used by internal users who are authorized to view everything, so we don't have to use get_if_authorized
        operation: Operation = OperationDataAccessService.get_by_id(operation_id)

        if operation.bc_obps_regulated_operation:
            raise Exception('Operation already has a BORO ID.')
        if not operation.is_regulated_operation:
            raise Exception('Non-regulated operations cannot be issued BORO IDs.')
        if operation.status != Operation.Statuses.REGISTERED:
            raise Exception('Operations must be registered before they can be issued a BORO ID.')

        operation.generate_unique_boro_id()
        if operation.bc_obps_regulated_operation is None:
            raise Exception('Failed to create a BORO ID for the operation.')
        operation.bc_obps_regulated_operation.issued_by = User.objects.get(user_guid=user_guid)
        operation.bc_obps_regulated_operation.save()
        # this adds 11 queries
        operation.save(update_fields=['bc_obps_regulated_operation'])

        return operation.bc_obps_regulated_operation

    @classmethod
    def generate_bcghg_id(cls, user_guid: UUID, operation_id: UUID) -> BcGreenhouseGasId:
        # This service is only used by internal users who are authorized to view everything, so we don't have to use get_if_authorized
        operation = OperationDataAccessService.get_by_id(operation_id)

        operation.generate_unique_bcghg_id()
        if operation.bcghg_id is None:
            raise Exception('Failed to create a BCGHG ID for the operation.')
        operation.bcghg_id.issued_by = User.objects.get(user_guid=user_guid)
        operation.bcghg_id.save()
        operation.save(update_fields=['bcghg_id'])

        return operation.bcghg_id

    @classmethod
    @transaction.atomic()
    def update_operator(cls, user_guid: UUID, operation: Operation, operator_id: UUID) -> Operation:
        """
        Update the operator for the operation
        At the time of implementation, this is only used for transferring operations between operators and,
        is only available to cas_analyst users
        """
        user = UserDataAccessService.get_by_guid(user_guid)
        if not user.is_cas_analyst():
            raise Exception(UNAUTHORIZED_MESSAGE)
        operation.operator_id = operator_id
        operation.save(update_fields=["operator_id"])

        return operation

    @classmethod
    def handle_change_of_registration_purpose(
        cls, user_guid: UUID, operation: Operation, payload: OperationInformationIn
    ) -> OperationInformationIn:
        """
        Logic to handle the situation when an industry user changes the selected registration purpose (RP) for their operation.
        Changing the RP can happen during or after submitting the operation's registration info.
        Depending on what the old RP was, some operation data may need to be removed.
        Generally, if the operation was already registered when the RP changed, the original data will be archived.
        If the operation wasn't yet registered when the selected RP changed, the original data will be deleted.
        """
        old_purpose = operation.registration_purpose
        if old_purpose == Operation.Purposes.OPTED_IN_OPERATION:
            payload.opt_in = False
            opted_in_detail = operation.opted_in_operation
            if opted_in_detail:
                OperationServiceV2.remove_opted_in_operation_detail(user_guid, operation.id)
        elif old_purpose == Operation.Purposes.NEW_ENTRANT_OPERATION:
            payload.date_of_first_shipment = None
            DocumentService.archive_or_delete_operation_document(user_guid, operation.id, 'new_entrant_application')

        new_purpose = payload.registration_purpose
        if new_purpose == Operation.Purposes.ELECTRICITY_IMPORT_OPERATION:
            # remove operation data that's no longer relevant (because operation is now an EIO)
            payload.activities = []
            payload.regulated_products = []
            payload.naics_code_id = None
            payload.secondary_naics_code_id = None
            payload.tertiary_naics_code_id = None
            payload.boundary_map = None
            payload.process_flow_diagram = None
            DocumentService.archive_or_delete_operation_document(user_guid, operation.id, 'process_flow_diagram')
            DocumentService.archive_or_delete_operation_document(user_guid, operation.id, 'boundary_map')
        elif new_purpose in [
            Operation.Purposes.REPORTING_OPERATION,
            Operation.Purposes.POTENTIAL_REPORTING_OPERATION,
        ]:
            # remove regulated products - they're not relevant to Reporting/Potential Reporting operations
            payload.regulated_products = []

        return payload
