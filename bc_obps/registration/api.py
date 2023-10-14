import json
from datetime import date
from typing import List, Optional
from bc_obps.registration.schema import (
    NaicsCategorySchema,
    NaicsCodeSchema,
    OperationIn,
    OperationOut,
    RequestAccessOut,
    UserOperatorIn,
    UserOperatorOut,
    Message,
)
from registration.utils import check_users_admin_request_eligibility, update_model_instance
from ninja import ModelSchema, Router
from ninja.responses import codes_4xx
from django.shortcuts import get_object_or_404
from django.forms import model_to_dict
from ninja import Field, Schema, ModelSchema
from .models import Contact, Operation, Operator, NaicsCode, NaicsCategory, ParentChildOperator, User, UserOperator
from ninja.errors import HttpError


router = Router()


@router.get("/naics_codes", response=List[NaicsCodeSchema])
def list_naics_codes(request):
    qs = NaicsCode.objects.all()
    return qs


@router.get("/naics_categories", response=List[NaicsCategorySchema])
def list_naics_codes(request):
    qs = NaicsCategory.objects.all()
    return qs


@router.get("/operations", response=List[OperationOut])
def list_operations(request):
    qs = Operation.objects.all()
    return qs


@router.get("/operations/{operation_id}", response=OperationOut)
def get_operation(request, operation_id: int):
    operation = get_object_or_404(Operation, id=operation_id)
    return operation


@router.post("/operations")
def create_operation(request, payload: OperationIn):
    if "operator" in payload.dict():
        operator = payload.dict()["operator"]
        op = get_object_or_404(Operator, id=operator)
        # Assign the Operator instance to the operation
        payload.operator = op
    if "naics_code" in payload.dict():
        naics_code = payload.dict()["naics_code"]
        nc = get_object_or_404(NaicsCode, id=naics_code)
        # Assign the naics_code instance to the operation
        payload.naics_code = nc
    if "naics_category" in payload.dict():
        naics_category = payload.dict()["naics_category"]
        nc = get_object_or_404(NaicsCategory, id=naics_category)
        # Assign the naics_category instance to the operation
        payload.naics_category = nc
    # temporary handling of many-to-many fields, will be addressed in #138
    if "documents" in payload.dict():
        del payload.documents
    if "contacts" in payload.dict():
        del payload.contacts
    if "petrinex_ids" in payload.dict():
        del payload.petrinex_ids
    if "regulated_products" in payload.dict():
        del payload.regulated_products
    operation = Operation.objects.create(**payload.dict())
    return {"name": operation.name}


@router.put("/operations/{operation_id}")
# NOTE: this endpoint automatically sets the operation's status to 'Pending', therefore
# it should be used when IOs are updating their own operational info, but cannot
# be used by program administrators reviewing a carbon tax exemption request
def update_operation(request, operation_id: int, payload: OperationIn):
    operation = get_object_or_404(Operation, id=operation_id)
    if "operator" in payload.dict():
        operator = payload.dict()["operator"]
        op = get_object_or_404(Operator, id=operator)
        # Assign the Operator instance to the operation
        operation.operator = op
    if "naics_code" in payload.dict():
        naics_code = payload.dict()["naics_code"]
        nc = get_object_or_404(NaicsCode, id=naics_code)
        # Assign the naics_code instance to the operation
        operation.naics_code = nc
    if "naics_category" in payload.dict():
        naics_category = payload.dict()["naics_category"]
        nc = get_object_or_404(NaicsCategory, id=naics_category)
        # Assign the naics_category instance to the operation
        payload.naics_category = nc
    # Update other attributes as needed
    for attr, value in payload.dict().items():
        if (
            attr != "operator"
            and attr != "naics_code"
            and attr != "naics_category"
            # temporary handling of many-to-many fields, will be addressed in #138
            and attr != "documents"
            and attr != "contacts"
            and attr != "petrinex_ids"
            and attr != "regulated_products"
        ):
            setattr(operation, attr, value)
    # set the operation status to 'pending' on update
    operation.status = "Pending"
    operation.save()
    return {"name": operation.name}


# OPERATOR
class OperatorOut(ModelSchema):
    """
    Schema for the Operator model
    """

    class Config:
        model = Operator
        model_fields = '__all__'


class SelectOperatorIn(Schema):
    operator_id: int


@router.get("/operators", response=List[OperatorOut])
def list_operators(request):
    qs = Operator.objects.all()
    return qs


@router.get("/operators/{operator_id}", response=OperatorOut)
def get_operator(request, operator_id: int):
    operator = get_object_or_404(Operator, id=operator_id)
    return operator


@router.get("/select-operator/{int:operator_id}", response={200: SelectOperatorIn, codes_4xx: Message})
def select_operator(request, operator_id: int):
    user: User = User.objects.first()  # FIXME: placeholders until after authentication is set up
    operator: Operator = get_object_or_404(Operator, id=operator_id)

    # check if user is eligible to request access
    status, message = check_users_admin_request_eligibility(user, operator)
    if status != 200:
        return status, message

    return 200, {"operator_id": operator.id}


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
    user_operator, _ = UserOperator.objects.get_or_create(
        user=user, operator=operator, role=UserOperator.Roles.ADMIN, status=UserOperator.Statuses.DRAFT
    )
    return 201, {"user_operator_id": user_operator.id}


@router.get("/select-operator/request-access/user-operator/{int:user_operator_id}", response=UserOperatorOut)
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


@router.put(
    "/select-operator/request-access/user-operator/{int:user_operator_id}",
    response={200: SelectOperatorIn, codes_4xx: Message},
)
def create_user_operator_request(request, user_operator_id: int, payload: UserOperatorIn):
    try:
        user_operator = get_object_or_404(UserOperator, id=user_operator_id)
        user: User = user_operator.user
        operator: Operator = user_operator.operator
        payload_dict = payload.dict()

        ### USER Part
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
            contact_instance: Contact = Contact(role=Contact.Roles.SENIOR_OFFICER)
            senior_officer_contact: Contact = update_model_instance(
                contact_instance, contact_fields_mapping, payload_dict
            )

        ### OPERATOR Part
        operator_has_parent_company: bool = payload_dict.get("operator_has_parent_company")

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
        updated_operator_instance: Operator = update_model_instance(operator, operator_related_fields, payload_dict)

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

        # saving the updated instances
        updated_user_instance.save()
        updated_operator_instance.save()

        if not is_senior_officer:
            senior_officer_contact.save()

        if operator_has_parent_company:
            parent_operator_instance.save()
            if percentage_owned_by_parent_company:
                parent_child_operator_instance.save()

    except ValidationError as e:
        return 400, {"message": e.messages[0]}

    # updating the status of the UserOperator instance
    user_operator.status = UserOperator.Statuses.PENDING
    user_operator.save(update_fields=["status"])

    return 200, {"operator_id": operator.id}


@router.put("/operations/{operation_id}/update-status")
def update_operation_status(request, operation_id: int):
    # need to convert request.body (a bytes object) to a string, and convert the string to a JSON object
    payload = json.loads(request.body.decode())
    status = getattr(Operation.Statuses, payload.get('status').upper())
    operation = get_object_or_404(Operation, id=operation_id)
    # TODO later: add data to verified_by once user authentication in place
    operation.status = status
    if operation.status in [Operation.Statuses.APPROVED, Operation.Statuses.REJECTED]:
        operation.verified_at = date
    data = serializers.serialize(
        'json',
        [
            operation,
        ],
    )
    operation_json_data = json.dumps(data, indent=4)
    operation.save()
    return operation_json_data


@router.get("/select-operator/{int:operator_id}", response=SelectOperatorIn)
def select_operator(request, operator_id: int):
    user: User = User.objects.first()  # FIXME: get the user from the request
    operator: Operator = get_object_or_404(Operator, id=operator_id)

    # User already has an admin user for this operator
    if UserOperator.objects.filter(
        users=user, operators=operator, role=UserOperator.Roles.ADMIN, status=UserOperator.Statuses.APPROVED
    ).exists():
        raise HttpError(400, "You are already an admin for this Operator!")

    # Operator already has an admin user
    if UserOperator.objects.filter(
        operators=operator, role=UserOperator.Roles.ADMIN, status=UserOperator.Statuses.APPROVED
    ).exists():
        raise HttpError(400, "This Operator already has an admin user!")

    return {"operator_id": operator.id}


@router.post("/select-operator/request-access", response=SelectOperatorIn)
def request_access(request, payload: SelectOperatorIn):
    user: User = User.objects.first()  # FIXME: get the user from the request
    payload_dict: dict = payload.dict()
    operator: Operator = get_object_or_404(Operator, id=payload_dict.get("operator_id"))

    # User already has an admin user for this operator
    if UserOperator.objects.filter(
        users=user, operators=operator, role=UserOperator.Roles.ADMIN, status=UserOperator.Statuses.APPROVED
    ).exists():
        raise HttpError(400, "You are already an admin for this Operator")

    # Operator already has an admin user
    if UserOperator.objects.filter(
        operators=operator, role=UserOperator.Roles.ADMIN, status=UserOperator.Statuses.APPROVED
    ).exists():
        raise HttpError(400, "This Operator already has an admin user")

    # Making a draft UserOperator instance
    UserOperator.objects.create(
        users=user, operators=operator, role=UserOperator.Roles.ADMIN, status=UserOperator.Statuses.DRAFT
    )
    return {"operator_id": operator.id}
