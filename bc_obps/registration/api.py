from django.contrib import admin
from django.urls import path
from datetime import date
from typing import List
from ninja import Router
from django.shortcuts import get_object_or_404
from .models import Operation, Operator, NaicsCode
from ninja.orm import create_schema
from ninja import Field, Schema


class TaskSchema(Schema):
    id: int
    title: str
    # The first Field param is the default, use ... for required fields.
    completed: bool = Field(..., alias="is_completed")
    owner_first_name: str = Field(None, alias="owner.first_name")


router = Router()


# Operator code schemas and endpoints
class OperatorSchema(Schema):
    id: int


# Naics code schemas and endpoints


class NaicsCodeSchema(Schema):
    id: int
    naics_code: str
    ciip_sector: str
    naics_description: str


@router.get("/naics_codes", response=List[NaicsCodeSchema])
def list_naics_codes(request):
    qs = NaicsCode.objects.all()
    return qs


# Operation schemas and endpoints
class OperationIn(Schema):
    operator: int = Field(..., alias="operator_id")
    name: str
    operation_type: str
    naics_code: int = Field(..., alias="naics_code_id")
    eligible_commercial_product_name: str
    permit_id: str
    npr_id: str
    ghfrp_id: str
    bcghrp_id: str
    petrinex_id: str
    latitude: int
    longitude: int
    legal_land_description: str
    nearest_municipality: str
    operator_percent_of_ownership: int
    registered_for_obps: bool
    estimated_emissions: int
    registered_for_obps: str = Field(default=False)
    # contacts:
    # documents:


class OperationOut(Schema):
    id: int
    operator_id: int = Field(..., alias="operator.id")
    name: str
    operation_type: str
    naics_code_id: int = Field(..., alias="naics_code.id")
    eligible_commercial_product_name: str
    permit_id: str
    npr_id: str
    ghfrp_id: str
    bcghrp_id: str
    petrinex_id: str
    latitude: int
    longitude: int
    legal_land_description: str
    nearest_municipality: str
    operator_percent_of_ownership: int
    registered_for_obps: bool
    estimated_emissions: int
    # contacts:
    # documents:


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
    # brianna do you still need now that we're doing in and out?
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
    if "documents" in payload.dict():
        del payload.documents
    if "contacts" in payload.dict():
        del payload.contacts
    operation = Operation.objects.create(**payload.dict())
    return {"id": operation.id}


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
