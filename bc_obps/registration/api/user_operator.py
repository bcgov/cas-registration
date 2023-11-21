from registration.schema import (
    UserOperatorOut,
    SelectOperatorIn,
    Message,
    UserOperatorIn,
    UserOut,
    OperatorOut,
    RequestAccessOut,
)
from .api_base import router
from typing import Optional
from django.shortcuts import get_object_or_404
from django.core.exceptions import ValidationError
from registration.models import Operator, User, UserOperator, Contact, ParentChildOperator, BusinessRole
from registration.utils import generate_useful_error, update_model_instance, check_users_admin_request_eligibility
from ninja.responses import codes_4xx


##### Helper Functions #####
def handle_user_operator_operator(payload: UserOperatorIn):
    """
    Handles the creation or updating of an Operator instance based on the provided payload data.

    This function processes user input to either create a new Operator instance or update an existing one.
    It also manages the creation of a parent company linked to the Operator if specified.

    Args:
        payload (UserOperatorIn): The user-provided payload containing Operator details.

    Returns:
        updated_operator_instance (Operator): The updated Operator instance.
        parent_operator_instance (Operator): The updated Parent Company Operator instance, if applicable.
        parent_child_operator_instance (ParentChildOperator): The new ParentChildOperator instance, if applicable.
    """
    payload_dict = payload.dict()
    operator_has_parent_company: bool = payload_dict.get("operator_has_parent_company")

    # use an existing Operator instance if one exists, otherwise create a new one
    cra_business_number: str = payload_dict.get("cra_business_number")
    existing_operator: Operator = Operator.objects.filter(cra_business_number=cra_business_number).first()
    operator_instance: Operator = existing_operator or Operator(
        cra_business_number=cra_business_number,
        bc_corporate_registry_number=payload_dict.get("bc_corporate_registry_number"),
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

    updated_operator_instance: Operator = update_model_instance(operator_instance, operator_related_fields, payload_dict)

    parent_operator_instance = None
    parent_child_operator_instance = None

    if operator_has_parent_company:
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

        if payload_dict.get("pc_mailing_address_same_as_physical"):
            payload_dict.update(
                {
                    "pc_mailing_street_address": payload_dict["pc_physical_street_address"],
                    "pc_mailing_municipality": payload_dict["pc_physical_municipality"],
                    "pc_mailing_province": payload_dict["pc_physical_province"],
                    "pc_mailing_postal_code": payload_dict["pc_physical_postal_code"],
                }
            )

        parent_operator_instance: Operator = Operator()
        parent_operator_instance = update_model_instance(parent_operator_instance, parent_operator_fields_mapping, payload_dict)

        percentage_owned_by_parent_company: Optional[int] = payload_dict.get('percentage_owned_by_parent_company')
        if percentage_owned_by_parent_company:
            parent_child_operator_instance = ParentChildOperator(
                parent_operator=parent_operator_instance,
                child_operator=updated_operator_instance,
                percentage_owned_by_parent_company=percentage_owned_by_parent_company,
            )

    return updated_operator_instance, parent_operator_instance, parent_child_operator_instance


def handle_user_operator_user(payload: UserOperatorIn, user):
    """
    A helper function to update the User model instance with the given payload and create a new Contact instance
    for the Senior Officer if the user is not a Senior Officer.

    Args:
        payload (UserOperatorIn): The payload containing the fields to update on the User model instance.
        user (User): The User model instance to update.

    Returns:
        updated_user_instance (User): The updated User model instance.
        senior_officer_contact (Contact): The new Contact instance for the Senior Officer, if applicable.
    """
    payload_dict = payload.dict()
    is_senior_officer: bool = payload_dict.get("is_senior_officer")

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

    # if the user is a Senior Officer, we update the Contact instance with the user's information
    contact_fields_mapping = user_related_fields
    # otherwise, we create a new Contact instance for the Senior Officer
    if not is_senior_officer:
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

    contact_instance: Contact = Contact(role=BusinessRole.objects.get(name="Senior Officer"))
    senior_officer_contact: Contact = update_model_instance(contact_instance, contact_fields_mapping, payload_dict)

    return updated_user_instance, senior_officer_contact


##### GET #####
@router.get("/select-operator/{int:operator_id}", response={200: SelectOperatorIn, codes_4xx: Message})
def select_operator(request, operator_id: int):
    user: User = User.objects.first()  # FIXME: placeholders until after authentication is set up
    operator: Operator = get_object_or_404(Operator, id=operator_id)

    # check if user is eligible to request access
    status, message = check_users_admin_request_eligibility(user, operator)
    if status != 200:
        return status, message

    return 200, {"operator_id": operator.id}


# FIXME: We might not need this endpoint anymore once ticket #299 is complete
@router.get(
    "/select-operator/user-operator/{int:user_operator_id}",
    response=UserOperatorOut,
)
def get_user_operator(request, user_operator_id: int):
    user_operator = get_object_or_404(UserOperator, id=user_operator_id)
    user_dict = UserOut.from_orm(user_operator.user).dict()
    operator_dict = OperatorOut.from_orm(user_operator.operator).dict()

    return {**user_dict, **operator_dict}


##### POST #####
@router.post("/select-operator/request-access", response={201: RequestAccessOut, codes_4xx: Message})
def request_access(request, payload: SelectOperatorIn):
    user: User = User.objects.first()  # FIXME: placeholders until after authentication is set up
    payload_dict: dict = payload.dict()
    operator: Operator = get_object_or_404(Operator, id=payload_dict.get("operator_id"))

    # check if user is eligible to request access
    status, message = check_users_admin_request_eligibility(user, operator)
    if status != 200:
        return status, message

    # Making a draft UserOperator instance if one doesn't exist
    user_operator, _ = UserOperator.objects.get_or_create(user=user, operator=operator, role=UserOperator.Roles.ADMIN, status=UserOperator.Statuses.DRAFT)
    return 201, {"user_operator_id": user_operator.id}


@router.post("/select-operator/user-operator", response={200: SelectOperatorIn, codes_4xx: Message})
def create_operator_and_user_operator_request(request, payload: UserOperatorIn):
    try:
        user: User = User.objects.first()  # FIXME: placeholders until after authentication is set up
        updated_user_instance, senior_officer_contact = handle_user_operator_user(payload, user)
        (
            created_operator_instance,
            parent_operator_instance,
            parent_child_operator_instance,
        ) = handle_user_operator_operator(payload)

    except ValidationError as e:
        return 400, {"message": generate_useful_error(e)}

    updated_user_instance.save()
    if senior_officer_contact:
        senior_officer_contact.save()

    created_operator_instance.save()
    if parent_operator_instance:
        parent_operator_instance.save()
        if parent_child_operator_instance:
            parent_child_operator_instance.save()

    # get or create a pending UserOperator instance
    UserOperator.objects.get_or_create(
        user=updated_user_instance,
        operator=created_operator_instance,
        role=UserOperator.Roles.ADMIN,
        status=UserOperator.Statuses.PENDING,
    )

    return 200, {"operator_id": created_operator_instance.id}


##### PUT #####
@router.put(
    "/select-operator/user-operator/{int:user_operator_id}",
    response={200: SelectOperatorIn, codes_4xx: Message},
)
def create_user_operator_request(request, user_operator_id: int, payload: UserOperatorIn):
    """
    This endpoint is used to update the User and Operator model instances associated with a UserOperator instance.
    We also create a new Contact instance for the Senior Officer if the user is not a Senior Officer.
    finally, we update the status of the UserOperator instance to PENDING.
    """
    try:
        user_operator = get_object_or_404(UserOperator, id=user_operator_id)

        updated_user_instance, senior_officer_contact = handle_user_operator_user(payload, user_operator.user)
        (
            updated_operator_instance,
            parent_operator_instance,
            parent_child_operator_instance,
        ) = handle_user_operator_operator(payload)

    except ValidationError as e:
        return 400, {"message": generate_useful_error(e)}

    updated_user_instance.save()
    if senior_officer_contact:
        senior_officer_contact.save()

    updated_operator_instance.save()
    if parent_operator_instance:
        parent_operator_instance.save()
        if parent_child_operator_instance:
            parent_child_operator_instance.save()

    # updating the status of the UserOperator instance
    user_operator.status = UserOperator.Statuses.PENDING
    user_operator.save(update_fields=["status"])

    return 200, {"operator_id": user_operator.operator.id}


##### DELETE #####
