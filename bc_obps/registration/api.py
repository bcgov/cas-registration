from django.contrib import admin
from django.urls import path
from datetime import date
from typing import List
from ninja import Router
from django.shortcuts import get_object_or_404
from .models import Operation, Operator, NaicsCode, NaicsCategory
from ninja.orm import create_schema
from ninja import Field, Schema, ModelSchema
from decimal import *


router = Router()


# Naics code schemas and endpoints
class NaicsCodeSchema(ModelSchema):
    """
    Schema for the NaicsCode model
    """

    class Config:
        model = NaicsCode
        model_fields = "__all__"


@router.get("/naics_codes", response=List[NaicsCodeSchema])
def list_naics_codes(request):
    qs = NaicsCode.objects.all()
    return qs


# Naics category schemas and endpoints
class NaicsCategorySchema(ModelSchema):
    """
    Schema for the NaicsCategory model
    """

    class Config:
        model = NaicsCategory
        model_fields = "__all__"


@router.get("/naics_categories", response=List[NaicsCategorySchema])
def list_naics_codes(request):
    qs = NaicsCategory.objects.all()
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
    latitude: Decimal
    longitude: Decimal
    legal_land_description: str
    nearest_municipality: str
    operator_percent_of_ownership: Decimal
    registered_for_obps: bool
    estimated_emissions: Decimal
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
    latitude: Decimal
    longitude: Decimal
    legal_land_description: str
    nearest_municipality: str
    operator_percent_of_ownership: Decimal
    registered_for_obps: bool
    estimated_emissions: Decimal
    # contacts:
    # documents:


class OperationSchema(ModelSchema):
    """
    Schema for the Operation model
    """

    class Config:
        model = Operation
        model_fields = "__all__"


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
    operation = Operation.objects.create(**payload.dict())
    return {"name": operation.name}


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
        if (
            attr != "operator"
            and attr != "naics_code"
            # temporary handling of many-to-many fields, will be addressed in #138
            and attr != "documents"
            and attr != "contacts"
        ):
            setattr(operation, attr, value)
    operation.save()
    return {"name": operation.name}
