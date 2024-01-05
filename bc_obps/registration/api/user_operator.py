from django.db import IntegrityError
import json, pytz
from registration.decorators import authorize
from registration.schema import (
    UserOperatorOut,
    SelectOperatorIn,
    Message,
    UserOperatorOperatorIn,
    RequestAccessOut,
    UserOperatorContactIn,
    IsApprovedUserOperator,
    UserOperatorOperatorIdOut,
    UserOperatorStatus,
    UserOperatorListOut,
)
from registration.schema.user_operator import SelectUserOperatorOperatorsOut
from typing import List, Optional
from .api_base import router
from django.shortcuts import get_object_or_404
from django.core.exceptions import ValidationError
from django.core import serializers
from registration.models import (
    AppRole,
    BusinessRole,
    BusinessStructure,
    Operator,
    User,
    UserOperator,
    Contact,
    ParentChildOperator,
    Address,
)
from registration.utils import (
    UNAUTHORIZED_MESSAGE,
    generate_useful_error,
    update_model_instance,
    check_users_admin_request_eligibility,
    check_access_request_matches_business_guid,
    get_an_operators_approved_users,
)
from ninja.responses import codes_4xx
from datetime import datetime
from ninja.errors import HttpError
from django.forms import model_to_dict


##### GET #####
@router.get("/user-operator-status-from-user", response={200: UserOperatorStatus, codes_4xx: Message})
@authorize(AppRole.get_industry_roles())
def get_user_operator_operator_id(request):
    user_operator = get_object_or_404(UserOperator, user_id=request.current_user.user_guid)
    return 200, {"status": user_operator.status}


@router.get("/is-approved-admin-user-operator/{user_guid}", response={200: IsApprovedUserOperator, codes_4xx: Message})
@authorize(AppRole.get_industry_roles())
def is_approved_admin_user_operator(request, user_guid: str):
    approved_user_operator: bool = UserOperator.objects.filter(
        user_id=user_guid, role=UserOperator.Roles.ADMIN, status=UserOperator.Statuses.APPROVED
    ).exists()

    return 200, {"approved": approved_user_operator}


@router.get("/user-operator-operator-id", response={200: UserOperatorOperatorIdOut, codes_4xx: Message})
@authorize(AppRole.get_industry_roles())
def get_user_operator_operator_id(request):
    user_operator = get_object_or_404(
        UserOperator, user_id=request.current_user.user_guid, status=UserOperator.Statuses.APPROVED
    )
    return 200, {"operator_id": user_operator.operator_id}


@router.get(
    "/select-operator/user-operator/{int:user_operator_id}",
    response=UserOperatorOut,
)
@authorize(AppRole.get_all_authorized_roles())
def get_user_operator(request, user_operator_id: int):
    user: User = request.current_user
    user_operator = get_object_or_404(UserOperator, id=user_operator_id)
    if user.is_industry_user():
        authorized_users = get_an_operators_approved_users(user_operator.operator)
        if user.user_guid not in authorized_users:
            raise HttpError(401, UNAUTHORIZED_MESSAGE)
    return UserOperatorOut.from_orm(user_operator)


@router.get("/operator-has-admin/{operator_id}", response={200: bool, codes_4xx: Message})
@authorize(AppRole.get_all_authorized_roles())
def get_user_operator_admin_exists(request, operator_id: int):
    has_admin = UserOperator.objects.filter(
        operator_id=operator_id, role=UserOperator.Roles.ADMIN, status=UserOperator.Statuses.APPROVED
    ).exists()
    return 200, has_admin


@router.get("/get-current-user-user-operators", response=List[SelectUserOperatorOperatorsOut])
@authorize(["industry_user_admin"])
def get_user(request):
    user_operator_list = UserOperator.objects.filter(
        user_id=request.current_user.user_guid, role=UserOperator.Roles.ADMIN, status=UserOperator.Statuses.APPROVED
    )
    return user_operator_list


@router.get("/user-operators", response=List[UserOperatorListOut])
@authorize(AppRole.get_authorized_irc_roles())
def list_user_operators(request):
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
@authorize(AppRole.get_industry_roles())
def request_access(request, payload: SelectOperatorIn):
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
@authorize(AppRole.get_industry_roles())
def request_access(request, payload: SelectOperatorIn):
    user: User = request.current_user
    operator: Operator = get_object_or_404(Operator, id=payload.operator_id)
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
@authorize(AppRole.get_industry_roles())
def create_operator_and_user_operator(request, payload: UserOperatorOperatorIn):
    user: User = request.current_user
    try:
        operator_has_parent_company: bool = payload.operator_has_parent_company

        # use an existing Operator instance if one exists, otherwise create a new one
        cra_business_number: str = payload.cra_business_number
        existing_operator: Operator = Operator.objects.filter(cra_business_number=cra_business_number).first()
        if existing_operator:
            return 400, {"message": "Operator with this CRA Business Number already exists."}

        operator_instance: Operator = Operator(
            cra_business_number=cra_business_number,
            bc_corporate_registry_number=payload.bc_corporate_registry_number,
            # treating business_structure as a foreign key
            business_structure=BusinessStructure.objects.get(name=payload.business_structure),
        )

        # create physical address record
        physical_address = Address.objects.create(
            street_address=payload.physical_street_address,
            municipality=payload.physical_municipality,
            province=payload.physical_province,
            postal_code=payload.physical_postal_code,
        )
        operator_instance.physical_address = physical_address

        if payload.mailing_address_same_as_physical:
            mailing_address = physical_address
        else:
            # create mailing address record if mailing address is not the same as the physical address
            mailing_address = Address.objects.create(
                street_address=payload.mailing_street_address,
                municipality=payload.mailing_municipality,
                province=payload.mailing_province,
                postal_code=payload.mailing_postal_code,
            )
        operator_instance.mailing_address = mailing_address

        # fields to update on the Operator model
        operator_related_fields = [
            "legal_name",
            "trade_name",
            "physical_address_id",
            "mailing_address_id",
            "website",
        ]
        created_operator_instance: Operator = update_model_instance(
            operator_instance, operator_related_fields, payload.dict()
        )

        parent_operator_instance = None
        parent_child_operator_instance = None

        if operator_has_parent_company:
            parent_operator_fields_mapping = {
                "pc_legal_name": "legal_name",
                "pc_trade_name": "trade_name",
                "pc_cra_business_number": "cra_business_number",
                "pc_bc_corporate_registry_number": "bc_corporate_registry_number",
                "pc_website": "website",
            }

            parent_operator_instance: Operator = Operator(
                business_structure=BusinessStructure.objects.get(name=payload.pc_business_structure)
            )

            # create physical address record
            pc_physical_address = Address.objects.create(
                street_address=payload.pc_physical_street_address,
                municipality=payload.pc_physical_municipality,
                province=payload.pc_physical_province,
                postal_code=payload.pc_physical_postal_code,
            )
            parent_operator_instance.physical_address = pc_physical_address

            if payload.pc_mailing_address_same_as_physical:
                pc_mailing_address = pc_physical_address
            else:
                # create mailing address record if mailing address is not the same as the physical address
                pc_mailing_address = Address.objects.create(
                    street_address=payload.pc_mailing_street_address or payload.pc_physical_street_address,
                    municipality=payload.pc_mailing_municipality or payload.pc_physical_municipality,
                    province=payload.pc_mailing_province or payload.pc_physical_province,
                    postal_code=payload.pc_mailing_postal_code or payload.pc_physical_postal_code,
                )
            parent_operator_instance.mailing_address = pc_mailing_address

            parent_operator_instance = update_model_instance(
                parent_operator_instance, parent_operator_fields_mapping, payload.dict()
            )

            percentage_owned_by_parent_company: Optional[int] = payload.percentage_owned_by_parent_company
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
@authorize(AppRole.get_industry_roles())
def create_user_operator_contact(request, payload: UserOperatorContactIn):
    try:
        user_operator_instance: UserOperator = get_object_or_404(UserOperator, id=payload.user_operator_id)
        user: User = request.current_user
        is_senior_officer: bool = payload.is_senior_officer

        address = Address.objects.create(
            street_address=payload.street_address,
            municipality=payload.municipality,
            province=payload.province,
            postal_code=payload.postal_code,
        )

        senior_officer_contact: Contact = Contact(
            business_role=BusinessRole.objects.get(role_name='Senior Officer'),
            position_title=payload.position_title,
            address=address,
        )

        # if the user is a senior officer, use their info as the contact info
        if is_senior_officer:
            senior_officer_contact.first_name = user.first_name
            senior_officer_contact.last_name = user.last_name
            senior_officer_contact.email = user.email
            senior_officer_contact.phone_number = user.phone_number
        # otherwise, use the info from the form
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
@authorize(["cas_admin", "cas_analyst", "industry_user_admin"])
def update_user_operator_user_status(request, user_guid: str):
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
@authorize(AppRole.get_authorized_irc_roles())
def update_user_operator_status(request, user_operator_id: str):
    current_cas_internal_user: User = request.current_user
    # need to convert request.body (a bytes object) to a string, and convert the string to a JSON object
    payload = json.loads(request.body.decode())
    is_new = getattr(UserOperator.Statuses, payload.get("is_new").upper())
    # If the operator is new, it must be approved separately before the user_operator can be approved
    if is_new:
        return HttpError(401, UNAUTHORIZED_MESSAGE)
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
