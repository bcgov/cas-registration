from datetime import datetime
from ninja import ModelSchema, Schema
from pydantic import BaseModel, Field
from typing import Optional, List
from decimal import Decimal

from reporting.models import ReportNewEntrant, ReportNewEntrantProduction, ReportNewEntrantEmission


class ReportNewEntrantProductionSchema(ModelSchema):
    production_amount: Optional[Decimal] = Field(None)
    id: int = Field(..., alias="id")
    name: str = Field(..., alias="name")
    unit: str = Field(..., alias="unit")

    class Meta:
        model = ReportNewEntrantProduction  # Link to Django model
        fields = ['production_amount']  # Specify which fields to include


class ReportNewEntrantEmissionSchema(ModelSchema):
    production_amount: Optional[Decimal] = Field(None)
    id: int = Field(..., alias="id")
    category_name: str = Field(..., alias="category_name")
    category_type: str = Field(..., alias="category_type")

    class Meta:
        model = ReportNewEntrantEmission
        fields = ['emission']


class NewEntrantDataSchema(ModelSchema):
    class Meta:
        model = ReportNewEntrant
        fields = ["id", "authorization_date", "first_shipment_date", "new_entrant_period_start", "assertion_statement"]
        fields_optional = '__all__'


class ReportNewEntrantDataOut(Schema):
    products: List[ReportNewEntrantProductionSchema]
    emissions: List[ReportNewEntrantEmissionSchema]
    new_entrant_data: Optional[NewEntrantDataSchema]
    naics_code: Optional[str]


class ReportNewEntrantSchemaIn(BaseModel):
    assertion_statement: bool
    authorization_date: Optional[datetime]
    first_shipment_date: Optional[datetime]
    new_entrant_period_start: Optional[datetime]
    products: List[dict]
    emissions: List[dict]
