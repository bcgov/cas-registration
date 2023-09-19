from django.contrib import admin
from django.urls import path
from datetime import date
from typing import List
from ninja import NinjaAPI, Schema
from django.shortcuts import get_object_or_404
from .models import Operation
from ninja.orm import create_schema

api = NinjaAPI()


# Operation schemas and endpoints

# brianna-this is inadvisable, put desired fields on it later
OperationSchema = create_schema(Operation)


@api.get("/operations", response=List[OperationSchema])
def list_operations(request):
    qs = Operation.objects.all()
    return qs


@api.get("/operations/{operation_id}", response=OperationSchema)
def get_operation(request, operation_id: int):
    operation = get_object_or_404(operation, id=operation_id)
    return operation


@api.post("/operations")
def create_operation(request, payload: OperationSchema):
    operation = Operation.objects.create(**payload.dict())
    return {"id": operation.id}


@api.put("/operations/{operation_id}")
def update_operation(request, operation_id: int, payload: OperationSchema):
    operation = get_object_or_404(operation, id=operation_id)
    for attr, value in payload.dict().items():
        setattr(operation, attr, value)
    operation.save()
    return {"success": True}
