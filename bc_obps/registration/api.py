from django.contrib import admin
from django.urls import path
from datetime import date
from typing import List
from ninja import Router
from django.shortcuts import get_object_or_404
from .models import Operation, Operator, NaicsCode
from ninja.orm import create_schema

router = Router()


# Operation schemas and endpoints

# brianna-this is inadvisable, put desired fields on it later
OperationSchema = create_schema(Operation)

# brianna this is how to add contacts: https://django-ninja.rest-framework.com/guides/response/


@router.get("/operations", response=List[OperationSchema])
def list_operations(request):
    qs = Operation.objects.all()
    return qs


@router.get("/operations/{operation_id}", response=OperationSchema)
def get_operation(request, operation_id: int):
    operation = get_object_or_404(Operation, id=operation_id)
    return operation


@router.post("/operations")
def create_operation(request, payload: OperationSchema):
    operation = Operation.objects.create(**payload.dict())
    return {"id": operation.id}


@router.put("/operations/{operation_id}")
def update_operation(request, operation_id: int, payload: OperationSchema):
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
    # Update other attributes as needed
    for attr, value in payload.dict().items():
        # brianna will need to fix this for docs and contacts
        if (
            attr != "operator"
            and attr != "naics_code"
            and attr != "documents"
            and attr != "contacts"
        ):
            setattr(operation, attr, value)
    operation.save()
    return {"success": True}
