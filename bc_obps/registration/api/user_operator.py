from .api_base import router
from typing import Optional
from django.shortcuts import get_object_or_404
from django.forms import model_to_dict
from django.core.exceptions import ValidationError
from registration.models import BusinessRole, Operator, User, UserOperator, Contact, ParentChildOperator
from registration.utils import update_model_instance, check_users_admin_request_eligibility
from ninja.responses import codes_4xx
from registration.schema import Message, UserOperatorIn, UserOperatorOut, SelectOperatorIn, RequestAccessOut

##### GET #####


@router.get(
    "/select-operator/user-operator/{int:user_operator_id}",
    response=UserOperatorOut,
)
def get_user_operator(request, user_operator_id: int):
    user_operator = get_object_or_404(UserOperator, id=user_operator_id)
    user: User = user_operator.user
    user_related_fields_dict = model_to_dict(
        user,
        fields=[
            "first_name",
            "last_name",
            "position_title",
            "street_address",
            "municipality",
            "province",
            "postal_code",
            "email",
        ],
    )
    operator: Operator = user_operator.operator
    operator_related_fields_dict = model_to_dict(
        operator,
        fields=[
            "legal_name",
            "trade_name",
            "cra_business_number",
            "bc_corporate_registry_number",
            "business_structure",
            "physical_street_address",
            "physical_municipality",
            "physical_province",
            "physical_postal_code",
            "mailing_street_address",
            "mailing_municipality",
            "mailing_province",
            "mailing_postal_code",
            "website",
        ],
    )

    return {
        **user_related_fields_dict,
        "phone_number": user.phone_number.as_e164,  # PhoneNumberField returns a PhoneNumber object and we need a string
        **operator_related_fields_dict,
    }


##### POST #####
@router.post("/select-operator/request-access", response={201: RequestAccessOut, codes_4xx: Message})
def request_access(request, payload):
    # breakpoint()
    return create_user_operator(payload)


##### PUT #####

#  Operators helpers
# TODO: do we need to handle validation errors like in `@router.put("/select-operator/user-operator/{int:user_operator_id}"`
def create_user_operator(payload: SelectOperatorIn):
    user: User = User.objects.first()  # FIXME: placeholders until after authentication is set up
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


def handle_user_operator_user(payload: UserOperatorIn, user):
    payload_dict = payload.dict()
    is_senior_officer: bool = payload_dict.get("is_senior_officer")

    # fields to update on the User model
    user_related_fields = [
        "first_name",
        "last_name",
        "position_title",
        "street_address",
        "municipality",
        "province",
        "postal_code",
        "email",
        "phone_number",
    ]

    updated_user_instance: User = update_model_instance(user, user_related_fields, payload_dict)

    if is_senior_officer:
        updated_user_instance.role = User.Roles.SENIOR_OFFICER
    else:
        # Create a new Contact instance for the Senior Officer
        contact_fields_mapping = {
            "so_first_name": "first_name",
            "so_last_name": "last_name",
            "so_position_title": "position_title",
            "so_street_address": "street_address",
            "so_municipality": "municipality",
            "so_province": "province",
            "so_postal_code": "postal_code",
            "so_email": "email",
            "so_phone_number": "phone_number",
        }
        contact_instance: Contact = Contact(business_role=BusinessRole.objects.get(name="Senior Officer"))
        senior_officer_contact: Contact = update_model_instance(contact_instance, contact_fields_mapping, payload_dict)
        updated_user_instance.save()
        if not is_senior_officer:
            senior_officer_contact.save()


def handle_user_operator_operator(payload: UserOperatorIn, operator):
    payload_dict = payload.dict()
    operator_has_parent_company: bool = payload_dict.get("operator_has_parent_company")
    cra_business_number = payload_dict.get("cra_business_number")
    new_operator, created = Operator.objects.get_or_create(cra_business_number=cra_business_number)

    if payload_dict.get("mailing_address_same_as_physical"):
        payload_dict["mailing_street_address"] = payload_dict["physical_street_address"]
        payload_dict["mailing_municipality"] = payload_dict["physical_municipality"]
        payload_dict["mailing_province"] = payload_dict["physical_province"]
        payload_dict["mailing_postal_code"] = payload_dict["physical_postal_code"]

    # fields to update on the Operator model
    operator_related_fields = [
        "legal_name",
        "trade_name",
        "business_structure",
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

    # TODO: not sure this works
    if not created:
        updated_operator_instance: Operator = update_model_instance(operator, operator_related_fields, payload_dict)
    else:
        updated_operator_instance: Operator = update_model_instance(new_operator, operator_related_fields, payload_dict)

    if operator_has_parent_company:
        # Create a new Operator instance for the Parent Company
        parent_operator_fields_mapping = {
            "pc_legal_name": "legal_name",
            "pc_trade_name": "trade_name",
            "pc_cra_business_number": "cra_business_number",
            "pc_bc_corporate_registry_number": "bc_corporate_registry_number",
            "pc_business_structure": "business_structure",
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

        # use physical address as mailing address if pc_mailing_address_same_as_physical is true
        if payload_dict.get("pc_mailing_address_same_as_physical"):
            payload_dict["pc_mailing_street_address"] = payload_dict["pc_physical_street_address"]
            payload_dict["pc_mailing_municipality"] = payload_dict["pc_physical_municipality"]
            payload_dict["pc_mailing_province"] = payload_dict["pc_physical_province"]
            payload_dict["pc_mailing_postal_code"] = payload_dict["pc_physical_postal_code"]

        parent_operator_instance: Operator = Operator()
        parent_operator_instance: Operator = update_model_instance(
            parent_operator_instance, parent_operator_fields_mapping, payload_dict
        )

        # Create a new ParentChildOperator instance
        percentage_owned_by_parent_company: Optional[int] = payload_dict.get('percentage_owned_by_parent_company')
        if percentage_owned_by_parent_company:
            parent_child_operator_instance = ParentChildOperator(
                parent_operator=parent_operator_instance,
                child_operator=updated_operator_instance,
                percentage_owned_by_parent_company=percentage_owned_by_parent_company,
            )
        updated_operator_instance.save()

        if operator_has_parent_company:
            parent_operator_instance.save()
            if percentage_owned_by_parent_company:
                parent_child_operator_instance.save()


@router.put(
    "/select-operator/user-operator/{int:user_operator_id}",
    response={200: SelectOperatorIn, codes_4xx: Message},
)
def create_user_operator_request(request, user_operator_id: int, payload: UserOperatorIn):
    try:
        user_operator = get_object_or_404(UserOperator, id=user_operator_id)
        user: User = user_operator.user
        operator: Operator = user_operator.operator

        handle_user_operator_user(payload, user)
        handle_user_operator_operator(payload, operator)

    except ValidationError as e:
        return 400, {"message": e.messages[0]}

    # updating the status of the UserOperator instance
    user_operator.status = UserOperator.Statuses.PENDING
    user_operator.save(update_fields=["status"])

    return 200, {"operator_id": operator.id}


##### DELETE #####
