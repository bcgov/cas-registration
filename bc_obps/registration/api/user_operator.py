from django.db import IntegrityError, transaction
import json, pytz
from registration.constants import UNAUTHORIZED_MESSAGE
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
from typing import List
from .api_base import router
from django.shortcuts import get_object_or_404
from django.core.exceptions import ValidationError
from django.core import serializers
from registration.models import (
    AppRole,
    BusinessRole,
    Operator,
    User,
    UserOperator,
    Contact,
    ParentOperator,
    Address,
)
from registration.utils import (
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
        # rollback the transaction if any of the following fails (mostly to prevent orphaned addresses)
        with transaction.atomic():
            cra_business_number: str = payload.cra_business_number
            existing_operator: Operator = Operator.objects.filter(cra_business_number=cra_business_number).first()
            # check if operator with this CRA Business Number already exists
            if existing_operator:
                return 400, {"message": "Operator with this CRA Business Number already exists."}

            operator_instance: Operator = Operator(
                cra_business_number=cra_business_number,
                bc_corporate_registry_number=payload.bc_corporate_registry_number,
                # treating business_structure as a foreign key
                business_structure=payload.business_structure,
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
            created_operator_instance.save()
            created_operator_instance.set_create_or_update(modifier=user)

            # create parent operator records
            operator_has_parent_operators: bool = payload.operator_has_parent_operators
            if operator_has_parent_operators:
                po_operator_fields_mapping = {
                    "po_legal_name": "legal_name",
                    "po_trade_name": "trade_name",
                    "po_cra_business_number": "cra_business_number",
                    "po_bc_corporate_registry_number": "bc_corporate_registry_number",
                    "po_website": "website",
                }
                for idx, po_operator in enumerate(payload.parent_operators_array):
                    new_po_operator_instance: ParentOperator = ParentOperator(
                        child_operator=created_operator_instance,
                        operator_index=idx + 1,
                    )
                    # handle addresses--if there's no mailing address given, it's the same as the physical address
                    po_physical_address = Address.objects.create(
                        street_address=po_operator.po_physical_street_address,
                        municipality=po_operator.po_physical_municipality,
                        province=po_operator.po_physical_province,
                        postal_code=po_operator.po_physical_postal_code,
                    )
                    new_po_operator_instance.physical_address = po_physical_address

                    if po_operator.po_mailing_address_same_as_physical:
                        new_po_operator_instance.mailing_address = po_physical_address
                    else:
                        po_mailing_address = Address.objects.create(
                            street_address=po_operator.po_mailing_street_address,
                            municipality=po_operator.po_mailing_municipality,
                            province=po_operator.po_mailing_province,
                            postal_code=po_operator.po_mailing_postal_code,
                        )
                        new_po_operator_instance.mailing_address = po_mailing_address

                    new_po_operator_instance.business_structure = po_operator.po_business_structure
                    new_po_operator_instance = update_model_instance(
                        new_po_operator_instance, po_operator_fields_mapping, po_operator.dict()
                    )
                    new_po_operator_instance.save()
                    new_po_operator_instance.set_create_or_update(modifier=user)

            # get or create a draft UserOperator instance
            user_operator, created = UserOperator.objects.get_or_create(
                user=user,
                operator=created_operator_instance,
                role=UserOperator.Roles.ADMIN,
            )
            if created:
                user_operator.set_create_or_update(modifier=user)
            return 200, {"user_operator_id": user_operator.id}

    except ValidationError as e:
        return 400, {"message": generate_useful_error(e)}
    except Exception as e:
        return 400, {"message": str(e)}


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



# Function to check if the status is valid. This was required because the previous check only worked for
# statuses that didn't have two words (e.g. "Pending" and "Approved" worked, but "Changes Requested" didn't)
def check_status(status: str):
    for statusEnum in UserOperator.Statuses:
        if statusEnum == status:
            return True
    return False

# this endpoint is for updating the status of a user
@router.put("/select-operator/user-operator/{user_guid}/update-status")
@authorize(["cas_admin", "cas_analyst", "industry_user_admin"])
def update_user_operator_user_status(request, user_guid: str):
    current_admin_user: User = request.current_user
    # need to convert request.body (a bytes object) to a string, and convert the string to a JSON object
    payload = json.loads(request.body.decode())
    status = payload.get("status")
    if not check_status(status):
        return 400, {"message": "Invalid status."}
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


# this endpoint is for updating the status of a user_operator
@router.put("/select-operator/user-operator/operator/{user_operator_id}/update-status")
@authorize(AppRole.get_authorized_irc_roles())
def update_user_operator_status(request, user_operator_id: str):
    current_cas_internal_user: User = request.current_user
    # need to convert request.body (a bytes object) to a string, and convert the string to a JSON object
    payload = json.loads(request.body.decode())
    status = payload.get("status")
    if not check_status(status):
        return 400, {"message": "Invalid status."}
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
