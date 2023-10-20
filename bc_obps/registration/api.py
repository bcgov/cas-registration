from django.contrib import admin
from django.urls import path
from datetime import date
from typing import List
from ninja import Router
from django.shortcuts import get_object_or_404
from .models import Operation, Operator, NaicsCode, NaicsCategory, User
from ninja import Field, Schema, ModelSchema
from decimal import *
from uuid import *
from django.core.management import call_command
from django.http import JsonResponse
from django.conf import settings
from django.http import HttpResponse
import os

router = Router()

# testing endpoint
@router.get("/test-setup")
def setup(request):
    print(settings.ENVIRONMENT)
    print(type(settings.ENVIRONMENT))
    if settings.ENVIRONMENT == "develop":
        try:
            call_command('truncate_all_tables')
            call_command('load_fixtures')
            return HttpResponse("Test setup complete.", status=200)
        except Exception as e:
            return HttpResponse("Test setup failed.", status=500)
    else:
        return HttpResponse("This endpoint only exists in the development environment.", status=404)


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


class OperationSchema(ModelSchema):
    """
    Schema for the Operation model
    """

    class Config:
        model = Operation
        model_fields = "__all__"


class OperationIn(Schema):
    name: str
    type: str
    operator_id: int
    naics_code_id: int
    naics_category_id: int
    reporting_activities: str
    physical_street_address: str
    physical_municipality: str
    physical_province: str
    physical_postal_code: str
    legal_land_description: str
    latitude: float
    longitude: float
    petrinex_ids: List[str]
    regulated_products: List[int]
    documents: List[int]
    contacts: List[int]


class OperationOut(OperationSchema):
    # handling aliases and optional fields
    operator_id: int = Field(..., alias="operator.id")
    naics_code_id: int = Field(..., alias="naics_code.id")
    naics_category_id: int = Field(..., alias="naics_category.id")
    previous_year_attributable_emissions: str = None
    swrs_facility_id: str = None
    bcghg_id: str = None
    current_year_estimated_emissions: str = None
    opt_in: bool = None
    new_entrant: bool = None
    start_of_commercial_operation: date = None
    major_new_operation: bool = None
    verified_at: date = None
    # temp handling of many to many field, addressed in #138
    # contacts:
    # documents:
    # regulated_products:
    # petrinex_ids:


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
