from datetime import datetime
from ninja import ModelSchema, Schema
from pydantic import BaseModel, Field
from typing import Optional, List
from decimal import Decimal

from registration.schema.v1 import RegulatedProductSchema
from reporting.models import ReportNewEntrant
from reporting.schema.emission_category import EmissionCategorySchema


class ReportNewEntrantProductionSchema(RegulatedProductSchema):
    production_amount: Optional[Decimal] = Field(None, alias='production_amount')


class ReportNewEntrantEmissionSchema(EmissionCategorySchema):
    emission: Optional[Decimal] = Field(None, alias='emission')


class NewEntrantDataSchema(ModelSchema):
    class Meta:
        model = ReportNewEntrant
        fields = ["id", "authorization_date", "first_shipment_date", "new_entrant_period_start", "assertion_statement"]

    id: Optional[int] = None
    authorization_date: Optional[datetime] = None
    first_shipment_date: Optional[datetime] = None
    new_entrant_period_start: Optional[datetime] = None
    assertion_statement: Optional[bool] = None


class ReportNewEntrantDataOut(Schema):
    products: List[ReportNewEntrantProductionSchema]
    emissions: List[ReportNewEntrantEmissionSchema]
    new_entrant_data: Optional[NewEntrantDataSchema]
    naics_code: Optional[str] = Field(None, alias='naics_code')


class ReportNewEntrantSchemaIn(BaseModel):
    assertion_statement: bool
    authorization_date: Optional[datetime]
    first_shipment_date: Optional[datetime]
    new_entrant_period_start: Optional[datetime]
    products: List[dict]
    emissions: List[dict]
