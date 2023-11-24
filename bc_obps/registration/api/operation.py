from .api_base import router
import json
from datetime import datetime
import pytz
from django.core import serializers
from typing import List
from django.shortcuts import get_object_or_404
from registration.models import Operation, Operator, NaicsCode, NaicsCategory, Contact, BusinessRole
from registration.schema import OperationIn, OperationOut
from registration.utils import update_model_instance, extract_fields_from_dict


##### GET #####


@router.get("/operations", response=List[OperationOut])
def list_operations(request):
    qs = Operation.objects.all()
    return qs


@router.get("/operations/{operation_id}", response=OperationOut)
def get_operation(request, operation_id: int):
    operation = get_object_or_404(Operation, id=operation_id)
    return operation


##### POST #####


@router.post("/operations")
def create_operation(request, payload: OperationIn):

    # application_lead_related_fields = extract_fields_from_dict(payload, [
    #     "al_first_name",
    #     "al_last_name",
    #     "al_position_title",
    #     "al_street_address",
    #     "al_municipality",
    #     "al_province",
    #     "al_postal_code",
    #     "al_email",
    #     "al_phone_number",
    # ])

    operation_related_fields: OperationIn = extract_fields_from_dict(
        payload.dict(),
        [
            "name",
            "type",
            "naics_code",
            "naics_category",
            "previous_year_attributable_emissions",
            "swrs_facility_id",
            "bcghg_id",
            "opt_in",
            "operator",
            "verified_at",
            "verified_by",
            "application_lead",
            "status",
            "regulated_products",
            "reporting_activities",
            "documents",
            # "operator_id",
            # "naics_code_id",
            # "naics_category_id",
        ],
    )

    fields_to_assign = ["operator", "naics_code", "naics_category"]
    for field_name in fields_to_assign:
        if field_name in operation_related_fields:
            field_value = operation_related_fields[field_name]
            model_class = {
                "operator": Operator,
                "naics_code": NaicsCode,
            }[field_name]
            obj = get_object_or_404(model_class, id=field_value)
            operation_related_fields[field_name] = obj
            # setattr(operation_related_fields, field_name, obj)
    print('operation_related_fields', operation_related_fields)
    breakpoint()
    operation = Operation.objects.create(operation_related_fields)
    for product_id in payload.regulated_products:
        operation.regulated_products.add(product_id)  # Adds each product
    for activity_id in payload.reporting_activities:
        operation.reporting_activities.add(activity_id)  # Adds each activity

    # Contact.objects.create(application_lead_related_fields)
    return {"name": operation.name, "id": operation.id}


##### PUT #####


@router.put("/operations/{operation_id}")
def update_operation(request, operation_id: int, submit, payload: OperationIn):
    breakpoint()
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
    if "Would you like to add an exemption ID application lead?" in payload.dict():
        breakpoint()
        # Create a new Contact instance for the application lead
        contact_fields_mapping = {
            "al_first_name": "first_name",
            "al_last_name": "last_name",
            "al_position_title": "position_title",
            "al_street_address": "street_address",
            "al_municipality": "municipality",
            "al_province": "province",
            "al_postal_code": "postal_code",
            "al_email": "email",
            "al_phone_number": "phone_number",
        }
        contact_instance: Contact = Contact(business_role=BusinessRole.objects.get(name="Operation Registration Lead"))
        application_lead_contact: Contact = update_model_instance(
            contact_instance, contact_fields_mapping, payload.dict()
        )
        application_lead_contact.save()
        payload.application_lead = application_lead_contact

    breakpoint()
    # Update other attributes as needed
    excluded_fields = [
        "operator",
        "naics_code",
        "documents",
        "contacts",
        "reporting_activities",
        "regulated_products",
    ]

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
    return {"name": operation.name}


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
