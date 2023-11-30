from .api_base import router
import json
from datetime import datetime
import pytz
from django.core import serializers
from typing import List
from django.shortcuts import get_object_or_404
from registration.models import MultipleOperator,Operation, Operator, NaicsCode, Contact, BusinessRole, User
from registration.schema import (
    OperationCreateIn,
    OperationUpdateIn,
    OperationOut,
    OperationCreateOut,
    OperationUpdateOut,
    Message,
)
from registration.utils import extract_fields_from_dict
from ninja.responses import codes_4xx




# Function to save multiple operators so we can reuse it in put/post routes
def save_multiple_operators(multiple_operators_array, operation):
    multiple_operator_fields_mapping = {
        "mo_legal_name": "legal_name",
        "mo_trade_name": "trade_name",
        "mo_cra_business_number": "cra_business_number",
        "mo_bc_corporate_registry_number": "bc_corporate_registry_number",
        "mo_business_structure": "business_structure",
        "mo_website": "website",
        "mo_percentage_ownership": "percentage_ownership",
        "mo_physical_street_address": "physical_street_address",
        "mo_physical_municipality": "physical_municipality",
        "mo_physical_province": "physical_province",
        "mo_physical_postal_code": "physical_postal_code",
        "mo_mailing_address_same_as_physical": "mailing_address_same_as_physical",
        "mo_mailing_street_address": "mailing_street_address",
        "mo_mailing_municipality": "mailing_municipality",
        "mo_mailing_province": "mailing_province",
        "mo_mailing_postal_code": "mailing_postal_code",
    }

    for idx, operator in enumerate(multiple_operators_array):
        new_operator = {}
        new_operator["operation_id"] = operation.id
        new_operator["operator_number"] = idx + 1

        # use physical address as mailing address if mo_mailing_address_same_as_physical is true
        if operator["mo_mailing_address_same_as_physical"]:
            operator["mo_mailing_street_address"] = operator["mo_physical_street_address"]
            operator["mo_mailing_municipality"] = operator["mo_physical_municipality"]
            operator["mo_mailing_province"] = operator["mo_physical_province"]
            operator["mo_mailing_postal_code"] = operator["mo_physical_postal_code"]

        for field in operator:
            if field in multiple_operator_fields_mapping:
                new_operator[multiple_operator_fields_mapping[field]] = operator[field]

        # check if there is a multiple_operator with that operation id and number
        # if there is, update it, if not, create it
        if MultipleOperator.objects.filter(operation_id=operation.id, operator_number=idx + 1).exists():
            MultipleOperator.objects.filter(operation_id=operation.id, operator_number=idx + 1).update(**new_operator)
        else:
            MultipleOperator.objects.create(**new_operator)


##### GET #####


@router.get("/operations", response={200: List[OperationOut], codes_4xx: Message})
def list_operations(request):
    qs = Operation.objects.all()
    return 200, qs


@router.get("/operations/{operation_id}", response={200: OperationOut, codes_4xx: Message})
def get_operation(request, operation_id: int):
    operation = get_object_or_404(Operation, id=operation_id)
    return 200, operation


##### POST #####


@router.post("/operations", response={201: OperationCreateOut, codes_4xx: Message})
def create_operation(request, payload: OperationCreateIn):
    payload_dict: dict = payload.dict()

    # check that the operation doesn't already exist
    bcghg_id: str = payload_dict.get("bcghg_id")
    if bcghg_id:
        existing_operation: Operation = Operation.objects.filter(bcghg_id=bcghg_id).first()
        if existing_operation:
            return 400, {"message": "Operation with this BCGHG ID already exists."}
    operation_related_fields: OperationCreateIn = extract_fields_from_dict(
        payload_dict,
        [
            "name",
            "type",
            "naics_code",
            "previous_year_attributable_emissions",
            "swrs_facility_id",
            "bcghg_id",
            "opt_in",
            "operator",
            "verified_at",
            "verified_by",
            "status",
        ],
    )

    fields_to_assign = ["operator", "naics_code"]
    for field_name in fields_to_assign:
        if field_name in operation_related_fields:
            field_value = operation_related_fields[field_name]
            model_class = {
                "operator": Operator,
                "naics_code": NaicsCode,
            }[field_name]
            obj = get_object_or_404(model_class, id=field_value)
            operation_related_fields[field_name] = obj
    operation = Operation.objects.create(**operation_related_fields)
    operation.regulated_products.set(payload.regulated_products)
    operation.reporting_activities.set(payload.reporting_activities)
    operation.documents.set(payload.documents)

    setattr(payload, field_name, obj)

    operation_has_multiple_operators: bool = payload.dict().get("operation_has_multiple_operators")
    multiple_operators_array: list = payload.dict().get("multiple_operators_array")

    fields_to_delete = [
        "documents",
        "contacts",
        "petrinex_ids",
        "regulated_products",
        "reporting_activities",
        "multiple_operators_array",
    ]

    for field_name in fields_to_delete:
        if field_name in payload.dict():
            delattr(payload, field_name)

    operation = Operation.objects.create(**payload.dict())

    if operation_has_multiple_operators:
        save_multiple_operators(multiple_operators_array, operation)

    return 201, {"name": operation.name, "id": operation.id}



##### PUT #####


@router.put("/operations/{operation_id}", response={200: OperationUpdateOut, codes_4xx: Message})
def update_operation(request, operation_id: int, submit, payload: OperationUpdateIn):
    payload_dict: dict = payload.dict()
    operation = get_object_or_404(Operation, id=operation_id)
    if "operator" in payload_dict:
        operator = payload_dict["operator"]
        op = get_object_or_404(Operator, id=operator)
        # Assign the Operator instance to the operation
        operation.operator = op
    if "naics_code" in payload_dict:
        naics_code = payload_dict["naics_code"]
        nc = get_object_or_404(NaicsCode, id=naics_code)
        # Assign the naics_code instance to the operation
        operation.naics_code = nc
    # if is_application_lead_external is null, the user hasn't filled out that part of the form. If it's true, the user has assigned a contact; if it's false, the lead is the user
    if "is_application_lead_external" in payload_dict:
        if payload_dict["is_application_lead_external"]:
            external_application_lead = payload_dict["application_lead"]
            eal, created = Contact.objects.update_or_create(
                id=external_application_lead,
                defaults={
                    "first_name": payload.first_name,
                    "last_name": payload.last_name,
                    "position_title": payload.position_title,
                    "street_address": payload.street_address,
                    "municipality": payload.municipality,
                    "province": payload.province,
                    "postal_code": payload.postal_code,
                    "email": payload.email,
                    "phone_number": payload.phone_number,
                    "business_role": BusinessRole.objects.get(role_name="Operation Registration Lead"),
                },
            )
            operation.application_lead = eal
        if payload_dict["is_application_lead_external"] is False:
            current_user_guid = json.loads(request.headers.get('Authorization'))["user_guid"]
            user: User = get_object_or_404(User, user_guid=current_user_guid)
            al, created = Contact.objects.update_or_create(
                email=user.email,
                defaults={
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "position_title": user.position_title,
                    "street_address": user.street_address,
                    "municipality": user.municipality,
                    "province": user.province,
                    "postal_code": user.postal_code,
                    "email": user.email,
                    "phone_number": user.phone_number,
                    "business_role": BusinessRole.objects.get(role_name="Operation Registration Lead"),
                },
            )
            operation.application_lead = al

    # Update other attributes as needed
    excluded_fields = [
        "operator",
        "naics_code",
        "documents",
        "contacts",
        "reporting_activities",
        "regulated_products",
        "application_lead",
        "multiple_operators_array",
    ]


    operation_has_multiple_operators: bool = payload.dict().get("operation_has_multiple_operators")
    multiple_operators_array: list = payload.dict().get("multiple_operators_array")

    if operation_has_multiple_operators:
        save_multiple_operators(multiple_operators_array, operation)

    for attr, value in payload.dict().items():
        if attr not in excluded_fields:
            setattr(operation, attr, value)
            # set the operation status to 'pending' on update
        if submit == "true":
            operation.status = Operation.Statuses.PENDING

    operation.regulated_products.clear()  # Clear existing products
    for product_id in payload.regulated_products:
        operation.regulated_products.add(product_id)  # Adds each product
    operation.reporting_activities.clear()  # Clear existing activities
    for activity_id in payload.reporting_activities:
        operation.reporting_activities.add(activity_id)  # Adds each activity

    operation.save()
    return 200, {"name": operation.name}


@router.put("/operations/{operation_id}/update-status")
def update_operation_status(request, operation_id: int):
    # need to convert request.body (a bytes object) to a string, and convert the string to a JSON object
    payload = json.loads(request.body.decode())
    status = getattr(Operation.Statuses, payload.get("status").upper())
    operation = get_object_or_404(Operation, id=operation_id)
    # TODO later: add data to verified_by once user authentication in place
    operation.status = status
    if operation.status in [Operation.Statuses.APPROVED, Operation.Statuses.REJECTED]:
        operation.verified_at = datetime.now(pytz.utc)
    data = serializers.serialize(
        "json",
        [
            operation,
        ],
    )
    operation.save()
    return data


##### DELETE #####
