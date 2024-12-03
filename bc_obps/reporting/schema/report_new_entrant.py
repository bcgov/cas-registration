from ninja import ModelSchema
from pydantic import BaseModel
from typing import Optional, List

from reporting.models import ReportNewEntrant


class ReportNewEntrantSchemaIn(BaseModel):
    assertion_statement: bool
    authorization_date: str
    first_shipment_date: Optional[str]
    new_entrant_period_start: Optional[str]
    products: list
    emissions: list


class ReportNewEntrantSchema(BaseModel):
    id: int
    authorization_date: str
    first_shipment_date: str
    new_entrant_period_start: str
    assertion_statement: bool


class ProductDataSchema(BaseModel):
    id: int
    name: str
    unit: str
    production_amount: Optional[int]


class NewEntrantDataSchema(ModelSchema):
    """
    Schema for the FuelType model
    """

    authorization_date: Optional[str] = None
    first_shipment_date: Optional[str] = None
    new_entrant_period_start: Optional[str] = None
    assertion_statement: Optional[bool] = None

    class Meta:
        model = ReportNewEntrant
        fields = ["id", "authorization_date", "first_shipment_date", "new_entrant_period_start", "assertion_statement"]


class EmissionSchema(BaseModel):
    id: int
    name: str
    emission: Optional[int]


class EmissionCategorydataSchema(BaseModel):
    category_type: str
    emissions: List[EmissionSchema]


class ReportNewEntrantDataOut(BaseModel):
    products: list[ProductDataSchema]
    emissions: list
    new_entrant_data: Optional[NewEntrantDataSchema]
