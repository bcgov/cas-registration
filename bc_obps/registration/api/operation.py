from registration.constants import UNAUTHORIZED_MESSAGE
from registration.decorators import authorize
from .api_base import router
from datetime import datetime
import pytz
from typing import List
from django.shortcuts import get_object_or_404
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
)
from registration.schema import (
    OperationCreateIn,
    OperationUpdateIn,
    OperationOut,
    OperationCreateOut,
    OperationUpdateOut,
    Message,
    OperationUpdateStatusIn,
)
from registration.utils import get_an_operators_approved_users
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


@router.get("/operations", response={200: List[OperationOut], codes_4xx: Message})
@authorize(AppRole.get_all_authorized_app_roles(), UserOperator.get_all_industry_user_operator_roles())
def list_operations(request):
    user: User = request.current_user
    # IRC users can see all operations except ones that are not started yet
    if user.is_irc_user():

        qs = Operation.objects.exclude(status=Operation.Statuses.NOT_STARTED)
        return 200, qs
    # Industry users can only see their companies' operations (if there's no user_operator or operator, then the user hasn't requested access to the operator)
    user_operator = UserOperator.objects.filter(user_id=user.user_guid).first()
    if not user_operator:
        raise HttpError(401, UNAUTHORIZED_MESSAGE)
    approved_users = get_an_operators_approved_users(user_operator.operator)
    if user.user_guid not in approved_users:
        raise HttpError(401, UNAUTHORIZED_MESSAGE)
    authorized_operations = Operation.objects.filter(operator_id=user_operator.operator.id).order_by(
        "-created_at"
    )  # order by created_at to get the latest one first
    return 200, authorized_operations


@router.get("/operations/{operation_id}", response={200: OperationOut, codes_4xx: Message})
@authorize(AppRole.get_all_authorized_app_roles(), UserOperator.get_all_industry_user_operator_roles())
def get_operation(request, operation_id: int):
    user: User = request.current_user
    if user.is_industry_user():
        user_operator = UserOperator.objects.filter(user_id=user.user_guid).first()
        if not user_operator:
            raise HttpError(401, UNAUTHORIZED_MESSAGE)
        approved_users = get_an_operators_approved_users(user_operator.operator)
        if user.user_guid not in approved_users:
            raise HttpError(401, UNAUTHORIZED_MESSAGE)
        operation = get_object_or_404(Operation, id=operation_id, operator_id=user_operator.operator.id)
    elif user.is_irc_user():
        operation = get_object_or_404(Operation, id=operation_id)
    return 200, operation


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
            "documents",
            "multiple_operators_array",
            "point_of_contact",
        }
    )

    # check that the operation doesn't already exist
    bcghg_id: str = payload.bcghg_id
    if bcghg_id:
        existing_operation: Operation = Operation.objects.filter(bcghg_id=bcghg_id).first()
        if existing_operation:
            return 400, {"message": "Operation with this BCGHG ID already exists."}

    operation = Operation.objects.create(**payload_dict, operator_id=payload.operator, naics_code_id=payload.naics_code)
    operation.regulated_products.set(payload.regulated_products)
    operation.reporting_activities.set(payload.reporting_activities)
    operation.documents.set(payload.documents)
    operation.set_create_or_update(modifier=user)

    if payload.operation_has_multiple_operators:
        create_or_update_multiple_operators(payload.multiple_operators_array, operation, user)

    return 201, {"name": operation.name, "id": operation.id}


##### PUT #####


@router.put("/operations/{operation_id}", response={200: OperationUpdateOut, codes_4xx: Message})
@authorize(AppRole.get_all_authorized_app_roles(), UserOperator.get_all_industry_user_operator_roles())
def update_operation(request, operation_id: int, submit: str, payload: OperationUpdateIn):
    user: User = request.current_user
    user_operator = UserOperator.objects.filter(user_id=user.user_guid).first()
    # if there's no user_operator or operator, then the user hasn't requested access to the operator
    if not user_operator:
        raise HttpError(401, UNAUTHORIZED_MESSAGE)
    operator = Operator.objects.get(id=user_operator.operator_id)

    approved_users = get_an_operators_approved_users(operator)
    if user.user_guid not in approved_users:
        raise HttpError(401, UNAUTHORIZED_MESSAGE)

    operation = get_object_or_404(Operation, id=operation_id)
    if payload.operator:
        operation.operator_id = payload.operator

    if payload.naics_code:
        operation.naics_code_id = payload.naics_code

    point_of_contact_address_id = None
    point_of_contact_id = payload.point_of_contact
    if point_of_contact_id:
        point_of_contact = Contact.objects.get(id=point_of_contact_id)
        point_of_contact_address_id = point_of_contact.address.id if point_of_contact.address else None

    is_user_point_of_contact = payload.is_user_point_of_contact

    # create or update the address for either user or external point of contact
    address, _ = Address.objects.update_or_create(
        id=point_of_contact_address_id,
        defaults={
            "street_address": payload.street_address,
            "municipality": payload.municipality,
            "province": payload.province,
            "postal_code": payload.postal_code,
        },
    )

    if is_user_point_of_contact is True:  # the point of contact is the user
        poc, _ = Contact.objects.update_or_create(
            id=point_of_contact_id,
            defaults={
                "first_name": payload.first_name,
                "last_name": payload.last_name,
                "position_title": payload.position_title,
                "email": payload.email,
                "phone_number": payload.phone_number,
                "business_role": BusinessRole.objects.get(role_name="Operation Registration Lead"),
                "address": address,
            },
        )
        poc.set_create_or_update(modifier=user)
        operation.point_of_contact = poc

    if is_user_point_of_contact is False:  # the point of contact is an external user
        external_poc, _ = Contact.objects.update_or_create(
            id=point_of_contact_id,
            defaults={
                "first_name": payload.external_point_of_contact_first_name,
                "last_name": payload.external_point_of_contact_last_name,
                "position_title": payload.external_point_of_contact_position_title,
                "email": payload.external_point_of_contact_email,
                "phone_number": payload.external_point_of_contact_phone_number,
                "business_role": BusinessRole.objects.get(role_name="Operation Registration Lead"),
                "address": address,
            },
        )
        external_poc.set_create_or_update(modifier=user)
        operation.point_of_contact = external_poc

    # updating only a subset of fields (using all fields would overwrite the existing ones)
    payload_dict: dict = payload.dict(
        include={
            "name",
            "type",
            "previous_year_attributable_emissions",
            "swrs_facility_id",
            "bcghg_id",
            "opt_in",
            "operation_has_multiple_operators",
        }
    )
    for attr, value in payload_dict.items():
        setattr(operation, attr, value)
    # set the operation status to 'pending' on update
    if submit == "true":
        operation.status = Operation.Statuses.PENDING
        operation.submission_date = datetime.now(pytz.utc)

    operation.regulated_products.set(payload.regulated_products)  # set replaces all existing products with the new ones
    operation.reporting_activities.set(
        payload.reporting_activities
    )  # set replaces all existing activities with the new ones

    operation.save()
    operation.set_create_or_update(modifier=user)

    if payload.operation_has_multiple_operators:
        create_or_update_multiple_operators(payload.multiple_operators_array, operation, user)
    else:  # if the operation doesn't have multiple operators anymore, archive all existing ones
        operation_multiple_operators = MultipleOperator.objects.filter(operation_id=operation.id)
        for operator in operation_multiple_operators:
            operator.set_archive(modifier=user)

    return 200, {"name": operation.name}


@router.put(
    "/operations/{operation_id}/update-status", response={200: OperationOut, codes_4xx: Message, codes_5xx: Message}
)
@authorize(AppRole.get_authorized_irc_roles())
def update_operation_status(request, operation_id: int, payload: OperationUpdateStatusIn):
    operation = get_object_or_404(Operation, id=operation_id)
    user: User = request.current_user
    status = Operation.Statuses(payload.status)
    operation.status = status
    if status in [Operation.Statuses.APPROVED, Operation.Statuses.DECLINED]:
        operation.verified_at = datetime.now(pytz.utc)
        operation.verified_by = user
        if status == Operation.Statuses.APPROVED:
            try:
                operation.generate_unique_boro_id()
            except Exception as e:
                return 400, {"message": str(e)}
    try:
        operation.save()
        operation.set_create_or_update(modifier=user)
    except Exception as e:
        return 500, {"message": str(e)}

    return 200, operation
