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
)
from .api_base import router
from typing import Optional
from django.shortcuts import get_object_or_404
from django.core.exceptions import ValidationError
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
    generate_useful_error,
    update_model_instance,
    check_users_admin_request_eligibility,
    check_access_request_matches_business_guid,
)
from ninja.responses import codes_4xx
import json
from typing import List


##### GET #####
@router.get("/is-approved-admin-user-operator/{user_guid}", response={200: IsApprovedUserOperator, codes_4xx: Message})
def is_approved_admin_user_operator(request, user_guid: str):
    approved_user_operator = UserOperator.objects.filter(user_id=user_guid, role=UserOperator.Roles.ADMIN, status=UserOperator.Statuses.APPROVED)

    return 200, {"approved": True if approved_user_operator else False}

@router.get(
    "/select-operator/user-operator/{int:user_operator_id}",
    response=UserOperatorOut,
)
def get_user_operator(request, user_operator_id: int):
    user_operator = get_object_or_404(UserOperator, id=user_operator_id)
    user_dict = UserOut.from_orm(user_operator.user).dict()
    operator_dict = OperatorOut.from_orm(user_operator.operator).dict()

    return {**user_dict, **operator_dict}


@router.get("/operator-has-admin/{operator_id}", response=bool)
def get_user_operator_admin_exists(request, operator_id: int):
    return UserOperator.objects.filter(operator_id=operator_id, role=UserOperator.Roles.ADMIN, status=UserOperator.Statuses.APPROVED).exists()


##### POST #####


@router.post("/select-operator/request-admin-access", response={201: RequestAccessOut, codes_4xx: Message})
def request_access(request, payload: SelectOperatorIn):
    user: User = request.current_user
    payload_dict: dict = payload.dict()
    operator: Operator = get_object_or_404(Operator, id=payload_dict.get("operator_id"))

    # check if user is eligible to request access
    status, message = check_users_admin_request_eligibility(user, operator)
    if status != 200:
        return status, message

    # Making a draft UserOperator instance if one doesn't exist
    user_operator, _ = UserOperator.objects.get_or_create(
        user=user, operator=operator, role=UserOperator.Roles.ADMIN, status=UserOperator.Statuses.DRAFT
    )
    return 201, {"user_operator_id": user_operator.id}


@router.post("/select-operator/request-access", response={201: RequestAccessOut, codes_4xx: Message})
def request_access(request, payload: SelectOperatorIn):
    current_user_guid = request.current_user.user_guid
    user: User = get_object_or_404(User, user_guid=current_user_guid)
    payload_dict: dict = payload.dict()
    operator: Operator = get_object_or_404(Operator, id=payload_dict.get("operator_id"))

    status, message = check_access_request_matches_business_guid(current_user_guid, operator)
    if status != 200:
        return status, message

    # Making a draft UserOperator instance if one doesn't exist
    user_operator, _ = UserOperator.objects.get_or_create(
        user=user, operator=operator, status=UserOperator.Statuses.PENDING
    )
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
    if parent_operator_instance:
        parent_operator_instance.save()
        if parent_child_operator_instance:
            parent_child_operator_instance.save()

    # get or create a draft UserOperator instance
    user_operator, _ = UserOperator.objects.get_or_create(
        user=user,
        operator=created_operator_instance,
        role=UserOperator.Roles.ADMIN,
    )

    return 200, {"user_operator_id": user_operator.id}


@router.post("/user-operator/contact", response={200: SelectOperatorIn, codes_4xx: Message})
def create_user_operator_contact(request, payload: UserOperatorContactIn):
    try:
        payload_dict: dict = payload.dict()
        user_operator_instance: UserOperator = get_object_or_404(UserOperator, id=payload_dict.get("user_operator_id"))
        user: User = user_operator_instance.user
        is_senior_officer: bool = payload_dict.get("is_senior_officer")

        senior_officer_contact: Contact = Contact(
            business_role=BusinessRole.objects.get(role_name='Senior Officer'),
            position_title=payload_dict.get("position_title"),
            street_address=payload_dict.get("street_address"),
            municipality=payload_dict.get("municipality"),
            province=payload_dict.get("province"),
            postal_code=payload_dict.get("postal_code"),
        )

        if is_senior_officer:
            senior_officer_contact.first_name = user.first_name
            senior_officer_contact.last_name = user.last_name
            senior_officer_contact.email = user.email
            senior_officer_contact.phone_number = user.phone_number
        else:
            senior_officer_contact.first_name = payload_dict.get("first_name")
            senior_officer_contact.last_name = payload_dict.get("last_name")
            senior_officer_contact.email = payload_dict.get("so_email")
            senior_officer_contact.phone_number = payload_dict.get("so_phone_number")

        senior_officer_contact.save()

    except ValidationError as e:
        return 400, {"message": generate_useful_error(e)}
    except Exception as e:
        return 400, {"message": str(e)}

    user_operator_instance.status = UserOperator.Statuses.PENDING
    user_operator_instance.save(update_fields=["status"])

    # Add the Senior Officer contact to the Operator instance
    operator: Operator = user_operator_instance.operator
    operator.contacts.add(senior_officer_contact)

    return 200, {"operator_id": operator.id}


##### PUT #####


##### DELETE #####
