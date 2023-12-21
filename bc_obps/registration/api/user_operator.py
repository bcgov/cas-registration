from django.db import IntegrityError
import json
from registration.schema import (
    UserOperatorOut,
    SelectOperatorIn,
    Message,
    UserOperatorOperatorIn,
    UserOut,
    OperatorOut,
    RequestAccessOut,
    UserOperatorContactIn,
    IsApprovedUserOperator,
    UserOperatorOperatorIdOut,
    UserOperatorStatus,
    UserOperatorListOut,
    UserOperatorRoleOut,
)
from registration.schema.user_operator import SelectUserOperatorOperatorsOut
from typing import List
from .api_base import router
from typing import Optional
from django.shortcuts import get_object_or_404
from django.core.exceptions import ValidationError
from django.core import serializers
from registration.models import (
    BusinessRole,
    BusinessStructure,
    Operator,
    User,
    UserOperator,
    Contact,
    ParentChildOperator,
)
from registration.utils import (
    UNAUTHORIZED_MESSAGE,
    generate_useful_error,
    update_model_instance,
    check_users_admin_request_eligibility,
    check_access_request_matches_business_guid,
    get_an_operators_approved_users,
    raise_401_if_role_not_authorized,
)
from ninja.responses import codes_4xx
from typing import List
import json
from datetime import datetime
import pytz
from ninja.errors import HttpError
from django.core import serializers
from django.forms import model_to_dict


##### GET #####
@router.get("/user-operator-status-from-user", response={200: UserOperatorStatus, codes_4xx: Message})
def get_user_operator_operator_id(request):
    raise_401_if_role_not_authorized(request, ["industry_user", "industry_user_admin"])
    user_operator = get_object_or_404(UserOperator, user_id=request.current_user.user_guid)
    return 200, {"status": user_operator.status}


@router.get("/is-approved-admin-user-operator/{user_guid}", response={200: IsApprovedUserOperator, codes_4xx: Message})
def is_approved_admin_user_operator(request, user_guid: str):
    raise_401_if_role_not_authorized(request, ["industry_user", "industry_user_admin"])

    approved_user_operator: bool = UserOperator.objects.filter(
        user_id=user_guid, role=UserOperator.Roles.ADMIN, status=UserOperator.Statuses.APPROVED
    ).exists()

    return 200, {"approved": approved_user_operator}


@router.get("/user-operator-operator-id", response={200: UserOperatorOperatorIdOut, codes_4xx: Message})
def get_user_operator_operator_id(request):
    raise_401_if_role_not_authorized(request, ["industry_user", "industry_user_admin"])
    current_user_guid = json.loads(request.headers.get('Authorization'))["user_guid"]
    user_operator = get_object_or_404(UserOperator, user_id=current_user_guid, status=UserOperator.Statuses.APPROVED)
    return 200, {"operator_id": user_operator.operator_id}


@router.get(
    "/select-operator/user-operator/{int:user_operator_id}",
    response=UserOperatorOut,
)
def get_user_operator(request, user_operator_id: int):
    raise_401_if_role_not_authorized(request, ["industry_user", "industry_user_admin", "cas_admin", "cas_analyst"])
    user_operator = get_object_or_404(UserOperator, id=user_operator_id)
    operator = get_object_or_404(Operator, id=user_operator.operator_id)
    if "industry" in request.current_user.app_role.role_name:
        authorized_users = get_an_operators_approved_users(operator)
        if request.current_user.user_guid not in authorized_users:
            raise HttpError(401, UNAUTHORIZED_MESSAGE)

    user_operator_role_dict = UserOperatorRoleOut.from_orm(user_operator).dict()
    user_dict = UserOut.from_orm(user_operator.user).dict()
    operator_dict = OperatorOut.from_orm(user_operator.operator).dict()

    result = {**user_operator_role_dict, **user_dict, **operator_dict}

    return result


@router.get("/operator-has-admin/{operator_id}", response={200: bool, codes_4xx: Message})
def get_user_operator_admin_exists(request, operator_id: int):
    raise_401_if_role_not_authorized(request, ["industry_user", "industry_user_admin", "cas_admin", "cas_analyst"])
    has_admin = UserOperator.objects.filter(
        operator_id=operator_id, role=UserOperator.Roles.ADMIN, status=UserOperator.Statuses.APPROVED
    ).exists()
    return 200, has_admin


@router.get("/get-current-user-user-operators", response=List[SelectUserOperatorOperatorsOut])
def get_user(request):
    raise_401_if_role_not_authorized(request, ["industry_user_admin"])
    user_operator_list = UserOperator.objects.filter(
        user_id=request.current_user.user_guid, role=UserOperator.Roles.ADMIN, status=UserOperator.Statuses.APPROVED
    )
    return user_operator_list


@router.get("/user-operators", response=List[UserOperatorListOut])
def list_user_operators(request):
    raise_401_if_role_not_authorized(request, ["cas_admin", "cas_analyst"])
    qs = UserOperator.objects.all()
    user_operator_list = []

    for user_operator in qs:
        user_operator_related_fields_dict = model_to_dict(
            user_operator,
            fields=[
                "id",
                "status",
            ],
        )
        user = user_operator.user
        user_related_fields_dict = model_to_dict(
            user,
            fields=[
                "first_name",
                "last_name",
                "email",
            ],
        )
        operator = user_operator.operator
        operator_related_fields_dict = model_to_dict(
            operator,
            fields=[
                "legal_name",
            ],
        )

        user_operator_list.append(
            {
                **user_operator_related_fields_dict,
                **user_related_fields_dict,
                **operator_related_fields_dict,
            }
        )
    return user_operator_list


##### POST #####


@router.post("/select-operator/request-admin-access", response={201: RequestAccessOut, codes_4xx: Message})
def request_access(request, payload: SelectOperatorIn):
    raise_401_if_role_not_authorized(request, ["industry_user", "industry_user_admin"])
    user: User = request.current_user
    operator: Operator = get_object_or_404(Operator, id=payload.operator_id)

    # check if user is eligible to request access
    status, message = check_users_admin_request_eligibility(user, operator)
    if status != 200:
        return status, message

    # Making a draft UserOperator instance if one doesn't exist
    user_operator, created = UserOperator.objects.get_or_create(
        user=user, operator=operator, role=UserOperator.Roles.ADMIN, status=UserOperator.Statuses.DRAFT
    )
    if created:
        user_operator.set_create_or_update(modifier=user)
    return 201, {"user_operator_id": user_operator.id}


@router.post("/select-operator/request-access", response={201: RequestAccessOut, codes_4xx: Message})
def request_access(request, payload: SelectOperatorIn):
    user: User = request.current_user
    operator: Operator = get_object_or_404(Operator, id=payload.operator_id)
    raise_401_if_role_not_authorized(request, ["industry_user", "industry_user_admin"])
    status, message = check_access_request_matches_business_guid(user.user_guid, operator)
    if status != 200:
        return status, message

    # Making a draft UserOperator instance if one doesn't exist
    user_operator, created = UserOperator.objects.get_or_create(
        user=user, operator=operator, status=UserOperator.Statuses.PENDING
    )
    if created:
        user_operator.set_create_or_update(modifier=user)
    return 201, {"user_operator_id": user_operator.id}


@router.post("/user-operator/operator", response={200: RequestAccessOut, codes_4xx: Message})
def create_operator_and_user_operator(request, payload: UserOperatorOperatorIn):
    user: User = request.current_user
    try:
        payload_dict = payload.dict()
        operator_has_parent_company: bool = payload_dict.get("operator_has_parent_company")

        # use an existing Operator instance if one exists, otherwise create a new one
        cra_business_number: str = payload_dict.get("cra_business_number")
        existing_operator: Operator = Operator.objects.filter(cra_business_number=cra_business_number).first()
        if existing_operator:
            return 400, {"message": "Operator with this CRA Business Number already exists."}

        operator_instance: Operator = Operator(
            cra_business_number=cra_business_number,
            bc_corporate_registry_number=payload_dict.get("bc_corporate_registry_number"),
            # treating business_structure as a foreign key
            business_structure=BusinessStructure.objects.get(name=payload_dict.get("business_structure")),
        )

        # Consolidate mailing address if indicated
        if payload_dict.get("mailing_address_same_as_physical"):
            payload_dict.update(
                {
                    "mailing_street_address": payload_dict["physical_street_address"],
                    "mailing_municipality": payload_dict["physical_municipality"],
                    "mailing_province": payload_dict["physical_province"],
                    "mailing_postal_code": payload_dict["physical_postal_code"],
                }
            )

        # fields to update on the Operator model
        operator_related_fields = [
            "legal_name",
            "trade_name",
            "physical_street_address",
            "physical_municipality",
            "physical_province",
            "physical_postal_code",
            "mailing_street_address",
            "mailing_municipality",
            "mailing_province",
            "mailing_postal_code",
            "website",
        ]

        created_operator_instance: Operator = update_model_instance(
            operator_instance, operator_related_fields, payload_dict
        )

        parent_operator_instance = None
        parent_child_operator_instance = None

        if operator_has_parent_company:
            parent_operator_fields_mapping = {
                "pc_legal_name": "legal_name",
                "pc_trade_name": "trade_name",
                "pc_cra_business_number": "cra_business_number",
                "pc_bc_corporate_registry_number": "bc_corporate_registry_number",
                "pc_physical_street_address": "physical_street_address",
                "pc_physical_municipality": "physical_municipality",
                "pc_physical_province": "physical_province",
                "pc_physical_postal_code": "physical_postal_code",
                "pc_mailing_street_address": "mailing_street_address",
                "pc_mailing_municipality": "mailing_municipality",
                "pc_mailing_province": "mailing_province",
                "pc_mailing_postal_code": "mailing_postal_code",
                "pc_website": "website",
            }

            if payload_dict.get("pc_mailing_address_same_as_physical"):
                payload_dict.update(
                    {
                        "pc_mailing_street_address": payload_dict["pc_physical_street_address"],
                        "pc_mailing_municipality": payload_dict["pc_physical_municipality"],
                        "pc_mailing_province": payload_dict["pc_physical_province"],
                        "pc_mailing_postal_code": payload_dict["pc_physical_postal_code"],
                    }
                )

            parent_operator_instance: Operator = Operator(
                business_structure=BusinessStructure.objects.get(name=payload_dict.get("pc_business_structure"))
            )
            parent_operator_instance = update_model_instance(
                parent_operator_instance, parent_operator_fields_mapping, payload_dict
            )

            percentage_owned_by_parent_company: Optional[int] = payload_dict.get('percentage_owned_by_parent_company')
            if percentage_owned_by_parent_company:
                parent_child_operator_instance = ParentChildOperator(
                    parent_operator=parent_operator_instance,
                    child_operator=created_operator_instance,
                    percentage_owned_by_parent_company=percentage_owned_by_parent_company,
                )

    except ValidationError as e:
        return 400, {"message": generate_useful_error(e)}
    except Exception as e:
        return 400, {"message": str(e)}

    created_operator_instance.save()
    created_operator_instance.set_create_or_update(modifier=user)
    if parent_operator_instance:
        parent_operator_instance.save()
        parent_operator_instance.set_create_or_update(modifier=user)
        if parent_child_operator_instance:
            parent_child_operator_instance.save()

    # get or create a draft UserOperator instance
    user_operator, created = UserOperator.objects.get_or_create(
        user=user,
        operator=created_operator_instance,
        role=UserOperator.Roles.ADMIN,
    )
    if created:
        user_operator.set_create_or_update(modifier=user)

    return 200, {"user_operator_id": user_operator.id}


@router.post("/user-operator/contact", response={200: SelectOperatorIn, codes_4xx: Message})
def create_user_operator_contact(request, payload: UserOperatorContactIn):
    raise_401_if_role_not_authorized(request, ["industry_user", "industry_user_admin"])
    try:
        user_operator_instance: UserOperator = get_object_or_404(UserOperator, id=payload.user_operator_id)
        user: User = request.current_user
        is_senior_officer: bool = payload.is_senior_officer

        senior_officer_contact: Contact = Contact(
            business_role=BusinessRole.objects.get(role_name='Senior Officer'),
            position_title=payload.position_title,
            street_address=payload.street_address,
            municipality=payload.municipality,
            province=payload.province,
            postal_code=payload.postal_code,
        )

        if is_senior_officer:
            senior_officer_contact.first_name = user.first_name
            senior_officer_contact.last_name = user.last_name
            senior_officer_contact.email = user.email
            senior_officer_contact.phone_number = user.phone_number
        else:
            senior_officer_contact.first_name = payload.first_name
            senior_officer_contact.last_name = payload.last_name
            senior_officer_contact.email = payload.so_email
            senior_officer_contact.phone_number = payload.so_phone_number

        senior_officer_contact.save()
        senior_officer_contact.set_create_or_update(modifier=user)

    except ValidationError as e:
        return 400, {"message": generate_useful_error(e)}
    # error handling when an existing contact with the same email already exists
    except IntegrityError as e:
        return 400, {"message": "A contact with this email already exists."}
    except Exception as e:
        return 400, {"message": str(e)}

    user_operator_instance.status = UserOperator.Statuses.PENDING
    user_operator_instance.save(
        update_fields=["status"],
    )
    user_operator_instance.set_create_or_update(modifier=user)

    # Add the Senior Officer contact to the Operator instance
    operator: Operator = user_operator_instance.operator
    operator.contacts.add(senior_officer_contact)
    operator.set_create_or_update(modifier=user)

    return 200, {"operator_id": operator.id}


##### PUT #####


@router.put("/select-operator/user-operator/{user_guid}/update-status")
def update_user_operator_user_status(request, user_guid: str):
    raise_401_if_role_not_authorized(request, ["cas_admin", "cas_analyst", "industry_user_admin"])
    current_admin_user: User = request.current_user
    # need to convert request.body (a bytes object) to a string, and convert the string to a JSON object
    payload = json.loads(request.body.decode())
    status = getattr(UserOperator.Statuses, payload.get("status").upper())
    user_operator = get_object_or_404(UserOperator, user=user_guid)
    user_operator.status = status
    if user_operator.status in [UserOperator.Statuses.APPROVED, UserOperator.Statuses.REJECTED]:
        user_operator.verified_at = datetime.now(pytz.utc)
        user_operator.verified_by_id = current_admin_user.user_guid
    if user_operator.status in [UserOperator.Statuses.PENDING]:
        user_operator.verified_at = None
        user_operator.verified_by_id = None
    data = serializers.serialize(
        "json",
        [
            user_operator,
        ],
    )
    user_operator.save()
    return data


@router.put("/select-operator/user-operator/operator/{user_operator_id}/update-status")
def update_user_operator_status(request, user_operator_id: str):
    raise_401_if_role_not_authorized(request, ["cas_admin", "cas_analyst"])
    current_cas_internal_user: User = request.current_user
    # need to convert request.body (a bytes object) to a string, and convert the string to a JSON object
    payload = json.loads(request.body.decode())
    status = getattr(UserOperator.Statuses, payload.get("status").upper())
    user_operator = get_object_or_404(UserOperator, id=user_operator_id)
    user_operator.status = status
    if user_operator.status in [UserOperator.Statuses.APPROVED, UserOperator.Statuses.REJECTED]:
        user_operator.verified_at = datetime.now(pytz.utc)
        user_operator.verified_by = current_cas_internal_user
    if user_operator.status in [UserOperator.Statuses.PENDING]:
        user_operator.verified_at = None
        user_operator.verified_by_id = None
    data = serializers.serialize(
        "json",
        [
            user_operator,
        ],
    )
    user_operator.save()
    return data


##### DELETE #####
