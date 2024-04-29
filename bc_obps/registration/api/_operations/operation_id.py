from uuid import UUID
from registration.constants import UNAUTHORIZED_MESSAGE
from django.db import transaction
from registration.decorators import authorize
from datetime import datetime
from django.core.exceptions import ValidationError
import pytz
from registration.api.api_base import router
from registration.models import (
    AppRole,
    Operation,
    Contact,
    BusinessRole,
    User,
    UserOperator,
    Document,
    DocumentType,
)
from registration.schema import (
    OperationUpdateIn,
    OperationOut,
    OperationUpdateOut,
    Message,
)
from registration.utils import (
    files_have_same_hash,
    generate_useful_error,
    get_current_user_approved_user_operator_or_raise,
)
from ninja.responses import codes_4xx
from ninja.errors import HttpError


@router.get(
    "/operations/{operation_id}",
    response={200: OperationOut, codes_4xx: Message},
    url_name="get_operation",
)
@authorize(AppRole.get_all_authorized_app_roles(), UserOperator.get_all_industry_user_operator_roles())
def get_operation(request, operation_id: UUID):
    # In this endpoint we are using different schema and different operation queries to optimize the response based on the user role
    user: User = request.current_user
    try:
        operation = (
            Operation.objects.only(
                *OperationOut.Config.model_fields,
                "naics_code",
                "point_of_contact__address",
                "point_of_contact__first_name",
                "point_of_contact__last_name",
                "point_of_contact__email",
                "point_of_contact__position_title",
                "point_of_contact__phone_number",
                "bc_obps_regulated_operation__id",
                "operator__physical_address",
                "operator__mailing_address",
                "operator__legal_name",
                "operator__trade_name",
                "operator__cra_business_number",
                "operator__bc_corporate_registry_number",
                "operator__business_structure",
                "operator__website",
            )
            .select_related(
                "operator__physical_address", "operator__mailing_address", "point_of_contact__address", "naics_code"
            )
            .prefetch_related("operator__parent_operators", "regulated_products")
            .get(id=operation_id)
        )
    except Operation.DoesNotExist:
        raise HttpError(404, "Not Found")
    if user.is_industry_user():
        if not operation.user_has_access(user.user_guid):
            raise HttpError(401, UNAUTHORIZED_MESSAGE)
        return 200, operation
    return 200, operation


@router.put(
    "/operations/{operation_id}", response={200: OperationUpdateOut, codes_4xx: Message}, url_name="update_operation"
)
@authorize(["industry_user"], UserOperator.get_all_industry_user_operator_roles())
def update_operation(request, operation_id: UUID, submit: str, form_section: int, payload: OperationUpdateIn):
    user: User = request.current_user
    user_operator = get_current_user_approved_user_operator_or_raise(user)

    try:
        operation = (
            Operation.objects.only('operator__id', 'point_of_contact__id')
            .select_related('operator', 'point_of_contact')
            .prefetch_related('regulated_products')
            .get(id=operation_id)
        )
    except Operation.DoesNotExist:
        raise HttpError(404, "Not Found")

    # industry users can only edit operations that belong to their operator
    if not operation.user_has_access(user.user_guid) or operation.operator_id != user_operator.operator_id:
        raise HttpError(401, UNAUTHORIZED_MESSAGE)

    try:
        with transaction.atomic():
            # the frontend includes default values, which are being sent in the payload to the backend. We need to know
            # whether the data being received in the payload is what the user has actually viewed, so we separate this
            # by form_section (the paginated form in the UI)
            if form_section == 1:
                if operation.status == Operation.Statuses.NOT_STARTED:
                    operation.status = Operation.Statuses.DRAFT
                payload_dict: dict = payload.dict(include={'name', 'type', 'bcghg_id', 'opt_in'})
                for attr, value in payload_dict.items():
                    setattr(operation, attr, value)
                operation.naics_code_id = payload.naics_code
                operation.save(update_fields=[*payload_dict.keys(), 'naics_code_id', 'status'])
                operation.regulated_products.set(payload.regulated_products)
            elif form_section == 2:
                point_of_contact_id = operation.point_of_contact_id or None
                is_external_point_of_contact = payload.is_external_point_of_contact

                if is_external_point_of_contact is False:  # the point of contact is the user
                    poc, _ = Contact.objects.update_or_create(
                        id=point_of_contact_id,
                        defaults={
                            "first_name": payload.first_name,
                            "last_name": payload.last_name,
                            "position_title": payload.position_title,
                            "email": payload.email,
                            "phone_number": payload.phone_number,
                            "business_role": BusinessRole.objects.get(role_name="Operation Registration Lead"),
                        },
                    )
                    poc.set_create_or_update(user.pk)
                    operation.point_of_contact = poc

                elif is_external_point_of_contact is True:  # the point of contact is an external user
                    external_poc, _ = Contact.objects.update_or_create(
                        id=point_of_contact_id,
                        defaults={
                            "first_name": payload.external_point_of_contact_first_name,
                            "last_name": payload.external_point_of_contact_last_name,
                            "position_title": payload.external_point_of_contact_position_title,
                            "email": payload.external_point_of_contact_email,
                            "phone_number": payload.external_point_of_contact_phone_number,
                            "business_role": BusinessRole.objects.get(role_name="Operation Registration Lead"),
                        },
                    )
                    external_poc.set_create_or_update(user.pk)
                    operation.point_of_contact = external_poc
                operation.save(update_fields=['point_of_contact'])

            elif form_section == 3 and payload.statutory_declaration:
                existing_statutory_document: Document = operation.documents.filter(
                    type=DocumentType.objects.get(name="signed_statutory_declaration")
                ).first()
                # if there is an existing statutory declaration document, check if the new one is different
                if existing_statutory_document:
                    # We need to check if the file has changed, if it has, we need to delete the old one and create a new one
                    if not files_have_same_hash(payload.statutory_declaration, existing_statutory_document.file):
                        existing_statutory_document.delete()
                        document = Document.objects.create(
                            file=payload.statutory_declaration,
                            type=DocumentType.objects.get(name="signed_statutory_declaration"),
                            created_by_id=user.pk,
                        )
                        operation.documents.set([document])
                else:
                    # if there is no existing statutory declaration document, create a new one
                    document = Document.objects.create(
                        file=payload.statutory_declaration,
                        type=DocumentType.objects.get(name="signed_statutory_declaration"),
                        created_by_id=user.pk,
                    )
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
                    operation.submission_date = datetime.now(pytz.utc)
                    operation.save(update_fields=['status', 'submission_date'])
            operation.set_create_or_update(user.pk)
            return 200, operation
    except ValidationError as e:
        return 400, {"message": generate_useful_error(e)}
    except Exception as e:
        return 400, {"message": str(e)}
