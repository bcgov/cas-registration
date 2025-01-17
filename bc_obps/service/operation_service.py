from typing import Dict, Optional, Union
from uuid import UUID
from django.db import transaction
from registration.emails import send_boro_id_application_email
from registration.enums.enums import BoroIdApplicationStates
from service.user_operator_service import UserOperatorService
from service.data_access_service.document_service import DocumentDataAccessService
from service.document_service import DocumentService
from service.data_access_service.user_service import UserDataAccessService
from service.data_access_service.contact_service import ContactDataAccessService
from registration.schema.v1.operation import OperationCreateIn, OperationFilterSchema, OperationUpdateIn
from service.data_access_service.operation_service import OperationDataAccessService
from django.db.models import Q
from django.core.paginator import Paginator
from ninja import Query
from registration.utils import (
    files_have_same_hash,
)
from datetime import datetime
from registration.models import (
    Contact,
    Document,
    Operation,
    Operator,
    User,
    UserOperator,
)
from zoneinfo import ZoneInfo
from django.core.files.base import ContentFile
from registration.constants import PAGE_SIZE, UNAUTHORIZED_MESSAGE


class OperationService:
    @classmethod
    def update_status(cls, user_guid: UUID, operation_id: UUID, status: Operation.Statuses) -> Operation:

        operation: Operation = OperationDataAccessService.get_by_id(operation_id)

        status = Operation.Statuses(status)
        if status in [Operation.Statuses.APPROVED, Operation.Statuses.DECLINED]:
            operation.verified_at = datetime.now(ZoneInfo("UTC"))
            operation.verified_by_id = user_guid
            if status == Operation.Statuses.APPROVED:
                operation.generate_unique_boro_id()
                # approve the operator if it's not already approved (the case for imported operators)
                operator: Operator = operation.operator
                if operator.status != Operator.Statuses.APPROVED:
                    operator.status = Operator.Statuses.APPROVED
                    operator.is_new = False
                    operator.verified_at = datetime.now(ZoneInfo("UTC"))
                    operator.verified_by_id = user_guid
                    operator.save(update_fields=["status", "is_new", "verified_at", "verified_by_id"])
                    operator.set_create_or_update(user_guid)
        operation.status = status
        operation.save(update_fields=['status', 'verified_at', 'verified_by_id', 'bc_obps_regulated_operation'])
        operation.set_create_or_update(user_guid)

        # send email notification to external user (email template depends on operation.status)
        if status in [
            Operation.Statuses.APPROVED,
            Operation.Statuses.DECLINED,
            Operation.Statuses.CHANGES_REQUESTED,
        ]:
            send_boro_id_application_email(
                application_state=BoroIdApplicationStates(status),
                operator_legal_name=operation.operator.legal_name,
                operation_name=operation.name,
                opted_in=operation.opt_in,
                operation_creator=operation.created_by,
                point_of_contact=operation.point_of_contact,
            )
        return operation

    @classmethod
    def get_if_authorized(cls, user_guid: UUID, operation_id: UUID) -> Operation:
        operation: Operation = OperationDataAccessService.get_by_id_for_operation_out_schema(operation_id)
        user: User = UserDataAccessService.get_by_guid(user_guid)
        if user.is_industry_user():
            if not operation.user_has_access(user.user_guid):
                raise Exception(UNAUTHORIZED_MESSAGE)
            return operation
        return operation

    @classmethod
    @transaction.atomic()
    def create_or_update_point_of_contact(
        cls, user_guid: UUID, existing_point_of_contact_id: Optional[int], payload: OperationUpdateIn
    ) -> Optional[Contact]:
        is_external_point_of_contact = payload.is_external_point_of_contact
        if is_external_point_of_contact is False:  # the point of contact is the user

            user_contact_data = {
                "first_name": payload.first_name,
                "last_name": payload.last_name,
                "position_title": payload.position_title,
                "email": payload.email,
                "phone_number": payload.phone_number,
            }
            poc = ContactDataAccessService.update_or_create(existing_point_of_contact_id, user_contact_data, user_guid)
            return poc

        elif is_external_point_of_contact is True:  # the point of contact is an external user
            external_contact_data = {
                "first_name": payload.external_point_of_contact_first_name,
                "last_name": payload.external_point_of_contact_last_name,
                "position_title": payload.external_point_of_contact_position_title,
                "email": payload.external_point_of_contact_email,
                "phone_number": payload.external_point_of_contact_phone_number,
            }

            external_poc = ContactDataAccessService.update_or_create(
                existing_point_of_contact_id, external_contact_data, user_guid
            )
            return external_poc
        return None

    @classmethod
    @transaction.atomic()
    def create_or_replace_statutory_declaration(
        cls, user_guid: UUID, payload: OperationUpdateIn, existing_statutory_document: Optional[Document]
    ) -> Optional[Document]:

        # if there is an existing statutory declaration document, check if the new one is different
        if existing_statutory_document:
            # We need to check if the file has changed, if it has, we need to delete the old one and create a new one
            if not files_have_same_hash(payload.statutory_declaration, existing_statutory_document.file):  # type: ignore[arg-type] # mypy is not aware of the schema validator
                existing_statutory_document.delete()
                return DocumentDataAccessService.create_document(
                    user_guid, payload.statutory_declaration, "signed_statutory_declaration"  # type: ignore[arg-type] # mypy is not aware of the schema validator
                )
            return None
        # if there is no existing statutory declaration document, create a new one
        return DocumentDataAccessService.create_document(
            user_guid, payload.statutory_declaration, "signed_statutory_declaration"  # type: ignore[arg-type] # mypy is not aware of the schema validator
        )

    @classmethod
    @transaction.atomic()
    def update_operation(
        cls, user_guid: UUID, operation_id: UUID, submit: str, form_section: int, payload: OperationUpdateIn
    ) -> Operation:
        user: User = UserDataAccessService.get_by_guid(user_guid)
        user_operator: UserOperator = UserOperatorService.get_current_user_approved_user_operator_or_raise(user)
        operation: Operation = OperationDataAccessService.get_by_id_for_update(operation_id)
        payload_statutory_declaration: Optional[ContentFile] = payload.statutory_declaration  # type: ignore[assignment] # mypy is not aware of the schema validator

        # industry users can only edit operations that belong to their operator
        if not operation.user_has_access(user_guid) or operation.operator_id != user_operator.operator_id:
            raise Exception(UNAUTHORIZED_MESSAGE)

        # the frontend includes default values, which are being sent in the payload to the backend. We need to know
        # whether the data being received in the payload is what the user has actually viewed, so we separate this
        # by form_section (the paginated form in the UI)
        if form_section == 1:
            if operation.status == Operation.Statuses.NOT_STARTED:
                operation.status = Operation.Statuses.DRAFT
            payload_dict: dict = payload.dict(include={'name', 'type', 'bcghg_id', 'opt_in'})
            for attr, value in payload_dict.items():
                setattr(operation, attr, value)
            operation.naics_code_id = payload.naics_code  # type: ignore[attr-defined]
            operation.save(update_fields=[*payload_dict.keys(), 'naics_code_id', 'status'])
            operation.regulated_products.set(payload.regulated_products)  # type: ignore[attr-defined]
        elif form_section == 2:
            existing_point_of_contact_id: Optional[int] = operation.point_of_contact_id or None
            poc = cls.create_or_update_point_of_contact(user_guid, existing_point_of_contact_id, payload)
            operation.point_of_contact = poc
            operation.save(update_fields=['point_of_contact'])

        elif form_section == 3 and payload_statutory_declaration:
            existing_statutory_document = DocumentService.get_existing_statutory_declaration_by_operation_id(
                operation_id
            )
            # If document is new or has changed, we need to set it to the operation
            document = cls.create_or_replace_statutory_declaration(user_guid, payload, existing_statutory_document)
            if document:
                operation.documents.set([document])

        if submit == "true":
            """
            if the PUT request has submit == "true" (i.e., user has clicked Submit button in UI form), the desired behaviour depends on
            the Operation's status:
                - if operation.status was already "Approved", it should remain Approved and the submission date should not be altered
                - if operation.status was "Changes Requested", it should switch to Pending
                - if operation.status was "Declined", it should switch to Pending
                - if operation.status was "Not Started", it should switch to Pending
                - if operation.status was "Pending", it should remain as Pending
            """
            if operation.status != Operation.Statuses.APPROVED:
                operation.status = Operation.Statuses.PENDING
                operation.submission_date = datetime.now(ZoneInfo("UTC"))
                operation.save(update_fields=['status', 'submission_date'])
                send_boro_id_application_email(
                    application_state=BoroIdApplicationStates.CONFIRMATION,
                    operator_legal_name=operation.operator.legal_name,
                    operation_name=operation.name,
                    opted_in=operation.opt_in,
                    operation_creator=operation.created_by,
                    point_of_contact=operation.point_of_contact,
                )
        operation.set_create_or_update(user_guid)
        return operation

    @classmethod
    def list_operations(
        cls, user_guid: UUID, filters: OperationFilterSchema = Query(...)
    ) -> Dict[str, Union[list[Operation], int]]:
        user = UserDataAccessService.get_by_guid(user_guid)
        page = filters.page
        bcghg_id = filters.bcghg_id
        bc_obps_regulated_operation = filters.bc_obps_regulated_operation
        name = filters.name
        operator = filters.operator
        sort_field = filters.sort_field
        sort_order = filters.sort_order
        status = filters.status
        sort_direction = "-" if sort_order == "desc" else ""

        base_qs = OperationDataAccessService.get_all_operations_for_user(user)
        list_of_filters = [
            Q(bcghg_id__id__icontains=bcghg_id) if bcghg_id else Q(),
            (
                Q(bc_obps_regulated_operation__id__icontains=bc_obps_regulated_operation)
                if bc_obps_regulated_operation
                else Q()
            ),
            Q(name__icontains=name) if name else Q(),
            Q(operator__legal_name__icontains=operator) if operator else Q(),
            Q(status__icontains=status) if status else Q(),
        ]

        qs = base_qs.filter(*list_of_filters).order_by(f"{sort_direction}{sort_field}")

        paginator = Paginator(qs, PAGE_SIZE)

        try:
            page = paginator.validate_number(page)
        except Exception:
            page = 1

        return {
            "data": [(operation) for operation in paginator.page(page).object_list],
            "row_count": paginator.count,
        }

    @classmethod
    @transaction.atomic()
    def create_operation(cls, user_guid: UUID, payload: OperationCreateIn) -> Dict[str, Union[str, UUID]]:
        user = UserDataAccessService.get_by_guid(user_guid)
        user_operator: UserOperator = UserOperatorService.get_current_user_approved_user_operator_or_raise(user)

        payload_dict = payload.dict(
            exclude={
                "regulated_products",
                "naics_code",
            }
        )
        payload_dict['operator_id'] = user_operator.operator_id
        payload_dict['naics_code_id'] = payload.naics_code  # type: ignore[attr-defined]
        # check that the operation doesn't already exist
        bcghg_id: Optional[str] = payload.bcghg_id
        if bcghg_id:
            operation_exists: bool = Operation.objects.only('bcghg_id').filter(bcghg_id_id=bcghg_id).exists()
            if operation_exists:
                raise Exception("Operation with this BCGHG ID already exists.")

        operation: Operation = OperationDataAccessService.create_operation(user_guid, payload_dict, payload.regulated_products)  # type: ignore[attr-defined]

        # Not needed for MVP
        # operation.activities.set(payload.activities)
        # if payload.operation_has_multiple_operators:
        #     create_or_update_multiple_operators(payload.multiple_operators_array, operation, user)

        return {"name": operation.name, "id": operation.id}
