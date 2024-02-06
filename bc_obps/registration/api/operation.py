from registration.constants import UNAUTHORIZED_MESSAGE
from django.db import transaction
from registration.decorators import authorize
from registration.schema.operation import OperationListOut
from .api_base import router
from datetime import datetime
from django.core.exceptions import ValidationError
import pytz
from typing import List
from django.shortcuts import get_object_or_404
from django.core.paginator import Paginator
from registration.models import (
    AppRole,
    MultipleOperator,
    Operation,
    Operator,
    Contact,
    BusinessRole,
    BusinessStructure,
    User,
    UserOperator,
    MultipleOperator,
    Address,
    Document,
    DocumentType,
)
from registration.schema import (
    OperationCreateIn,
    OperationUpdateIn,
    OperationPaginatedOut,
    OperationOut,
    OperationCreateOut,
    OperationUpdateOut,
    Message,
    OperationUpdateStatusIn,
)
from registration.utils import get_an_operators_approved_users, generate_useful_error
from ninja.responses import codes_4xx, codes_5xx
from ninja.errors import HttpError


# Function to save multiple operators so we can reuse it in put/post routes
def create_or_update_multiple_operators(
    multiple_operators_array: List[MultipleOperator], operation: Operation, user: User
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

        new_operator["business_structure"] = BusinessStructure.objects.get(name=operator["mo_business_structure"])
        # TODO: archive multiple operators in #361 that are not in the array anymore once #326 is done

        # check if there is a multiple_operator with that operation id and number
        # if there is, update it, if not, create it
        multiple_operator, _ = MultipleOperator.objects.update_or_create(
            operation_id=operation.id, operator_index=idx + 1, defaults={**new_operator}
        )
        multiple_operator.set_create_or_update(modifier=user)


##### GET #####


@router.get("/operations", response={200: OperationPaginatedOut, codes_4xx: Message})
@authorize(AppRole.get_all_authorized_app_roles(), UserOperator.get_all_industry_user_operator_roles())
def list_operations(request, page: int = 1):
    user: User = request.current_user
    # IRC users can see all operations except ones that are not started yet
    if user.is_irc_user():
        qs = (
            Operation.objects.select_related("operator", "bc_obps_regulated_operation")
            .exclude(status=Operation.Statuses.NOT_STARTED)
            .only(*OperationListOut.Config.model_fields, "operator__legal_name", "bc_obps_regulated_operation__id")
            .order_by("-created_at")
        )
        paginator = Paginator(qs, 20)
        return 200, OperationListOut(
            data=[OperationOut.from_orm(operation) for operation in paginator.page(page).object_list],
            row_count=paginator.count,
        )
    # Industry users can only see their companies' operations (if there's no user_operator or operator, then the user hasn't requested access to the operator)
    user_operator = UserOperator.objects.filter(user_id=user.user_guid).only("operator_id").first()
    if not user_operator:
        raise HttpError(401, UNAUTHORIZED_MESSAGE)
    approved_users = get_an_operators_approved_users(user_operator.operator_id)
    if user.user_guid not in approved_users:
        raise HttpError(401, UNAUTHORIZED_MESSAGE)
    # order by created_at to get the latest one first
    operators_operations = (
        Operation.objects.select_related("operator", "bc_obps_regulated_operation")
        .filter(operator_id=user_operator.operator_id)
        .order_by("-created_at")
        .only(*OperationListOut.Config.model_fields, "operator__legal_name", "bc_obps_regulated_operation__id")
    )
    paginator = Paginator(operators_operations, 20)
    return 200, {
        "data": paginator.page(page).object_list,
        "row_count": paginator.count,
    }


@router.get("/operations/{operation_id}", response={200: OperationOut, codes_4xx: Message})
@authorize(AppRole.get_all_authorized_app_roles(), UserOperator.get_all_industry_user_operator_roles())
def get_operation(request, operation_id: int):
    user: User = request.current_user
    if user.is_industry_user():
        user_operator = UserOperator.objects.filter(user_id=user.user_guid).first()
        if not user_operator:
            raise HttpError(401, UNAUTHORIZED_MESSAGE)
        approved_users = get_an_operators_approved_users(user_operator.operator_id)
        if user.user_guid not in approved_users:
            raise HttpError(401, UNAUTHORIZED_MESSAGE)
        operation = get_object_or_404(Operation, id=operation_id, operator_id=user_operator.operator.id)
    elif user.is_irc_user():
        operation = get_object_or_404(Operation, id=operation_id)
    return 200, OperationOut.from_orm(operation)


##### POST #####


@router.post("/operations", response={201: OperationCreateOut, codes_4xx: Message})
@authorize(["industry_user"], UserOperator.get_all_industry_user_operator_roles())
def create_operation(request, payload: OperationCreateIn):
    user: User = request.current_user
    # excluding the fields that have to be handled separately (We don't assign point of contact to the operation here, we do it in the next/update step)
    payload_dict: dict = payload.dict(
        exclude={
            "regulated_products",
            "reporting_activities",
            "operator",
            "naics_code",
            "multiple_operators_array",
            "point_of_contact",
            "statutory_declaration",
        }
    )

    # check that the operation doesn't already exist
    bcghg_id: str = payload.bcghg_id
    if bcghg_id:
        existing_operation: Operation = Operation.objects.filter(bcghg_id=bcghg_id).first()
        if existing_operation:
            return 400, {"message": "Operation with this BCGHG ID already exists."}
    try:
        with transaction.atomic():
            operation = Operation.objects.create(
                **payload_dict, operator_id=payload.operator, naics_code_id=payload.naics_code
            )
            operation.regulated_products.set(payload.regulated_products)
            # Not needed for MVP
            # operation.reporting_activities.set(payload.reporting_activities)
            operation.set_create_or_update(modifier=user)

            if payload.operation_has_multiple_operators:
                create_or_update_multiple_operators(payload.multiple_operators_array, operation, user)

            return 201, {"name": operation.name, "id": operation.id}
    except ValidationError as e:
        return 400, {"message": generate_useful_error(e)}
    except Exception as e:
        return 400, {"message": str(e)}


##### PUT #####


@router.put("/operations/{operation_id}", response={200: OperationUpdateOut, codes_4xx: Message})
@authorize(AppRole.get_all_authorized_app_roles(), UserOperator.get_all_industry_user_operator_roles())
def update_operation(request, operation_id: int, submit: str, form_section: int, payload: OperationUpdateIn):
    user: User = request.current_user
    user_operator = UserOperator.objects.filter(user_id=user.user_guid).first()
    # if there's no user_operator or operator, then the user hasn't requested access to the operator
    if not user_operator:
        raise HttpError(401, UNAUTHORIZED_MESSAGE)
    operator = Operator.objects.get(id=user_operator.operator_id)

    approved_users = get_an_operators_approved_users(operator.pk)
    if user.user_guid not in approved_users:
        raise HttpError(401, UNAUTHORIZED_MESSAGE)

    operation = get_object_or_404(Operation, id=operation_id)

    # industry users can only edit operations that belong to their operator
    if operation.operator_id != user_operator.operator.id:
        raise HttpError(401, UNAUTHORIZED_MESSAGE)
    try:
        with transaction.atomic():
            operation.operator_id = payload.operator
            operation.naics_code_id = payload.naics_code

            # the frontend includes default values, which are being sent in the payload to the backend. We need to know
            # whether the data being received in the payload is what the user has actually viewed, so we separate this
            # by form_section (the paginated form in the UI)
            if form_section == 1:
                payload_dict: dict = payload.dict(
                    include={
                        'name',
                        'type',
                        'bcghg_id',
                        'opt_in',
                    }
                )
                for attr, value in payload_dict.items():
                    setattr(operation, attr, value)
                operation.regulated_products.set(payload.regulated_products)
                operation.save(update_fields=list(payload_dict.keys()) + ['naics_code', 'operator'])
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
                    poc.set_create_or_update(modifier=user)
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
                    external_poc.set_create_or_update(modifier=user)
                    operation.point_of_contact = external_poc
                operation.save(update_fields=['point_of_contact'])

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

            if payload.statutory_declaration:
                operation.documents.filter(type=DocumentType.objects.get(name="signed_statutory_declaration")).delete()

                document = Document.objects.create(
                    file=payload.statutory_declaration,
                    type=DocumentType.objects.get(name="signed_statutory_declaration"),
                )
                operation.documents.set([document])

            operation.set_create_or_update(modifier=user)
            return 200, {"name": operation.name}
    except ValidationError as e:
        return 400, {"message": generate_useful_error(e)}
    except Exception as e:
        return 400, {"message": str(e)}


@router.put(
    "/operations/{operation_id}/update-status", response={200: OperationOut, codes_4xx: Message, codes_5xx: Message}
)
@authorize(AppRole.get_authorized_irc_roles())
def update_operation_status(request, operation_id: int, payload: OperationUpdateStatusIn):
    operation = get_object_or_404(Operation, id=operation_id)
    user: User = request.current_user
    try:
        with transaction.atomic():
            status = Operation.Statuses(payload.status)
            operation.status = status
            if status in [Operation.Statuses.APPROVED, Operation.Statuses.DECLINED]:
                operation.verified_at = datetime.now(pytz.utc)
                operation.verified_by = user
                if status == Operation.Statuses.APPROVED:
                    operation.generate_unique_boro_id()
                    # approve the operator if it's not already approved (the case for imported operators)
                    operator: Operator = operation.operator
                    if operator.status != Operator.Statuses.APPROVED:
                        operator.status = Operator.Statuses.APPROVED
                        operator.is_new = False
                        operator.verified_at = datetime.now(pytz.utc)
                        operator.verified_by = user
                        operator.save(update_fields=["status", "is_new", "verified_at", "verified_by"])
                        operator.set_create_or_update(modifier=user)
            operation.save()
            operation.set_create_or_update(modifier=user)

            return 200, operation
    except ValidationError as e:
        return 400, {"message": generate_useful_error(e)}
    except Exception as e:
        return 400, {"message": str(e)}
