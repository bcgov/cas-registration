from .api_base import router
import json
from datetime import datetime
import pytz
from django.core import serializers
from typing import List
from django.shortcuts import get_object_or_404
from registration.models import Operation, Operator, NaicsCode, NaicsCategory
from registration.schema import OperationIn, OperationOut


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
    fields_to_assign = ["operator", "naics_code", "naics_category"]

    for field_name in fields_to_assign:
        if field_name in payload.dict():
            field_value = payload.dict()[field_name]
            model_class = {
                "operator": Operator,
                "naics_code": NaicsCode,
                "naics_category": NaicsCategory,
            }[field_name]
            obj = get_object_or_404(model_class, id=field_value)
            setattr(payload, field_name, obj)

    fields_to_delete = ["documents", "contacts", "petrinex_ids", "regulated_products", "reporting_activities"]

    for field_name in fields_to_delete:
        if field_name in payload.dict():
            delattr(payload, field_name)

    operation = Operation.objects.create(**payload.dict())
    return {"name": operation.name, "id": operation.id}


##### PUT #####


@router.put("/operations/{operation_id}")
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
    excluded_fields = [
        "operator",
        "naics_code",
        "naics_category",
        "documents",
        "contacts",
        "reporting_activities",
        "regulated_products",
    ]

    for attr, value in payload.dict().items():
        if attr not in excluded_fields:
            setattr(operation, attr, value)
        # set the operation status to 'pending' on update
        operation.status = "Pending"
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
