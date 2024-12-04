from datetime import datetime
from ninja import ModelSchema
from pydantic import BaseModel
from typing import Optional, List

from reporting.models import ReportNewEntrant


class ReportNewEntrantSchemaIn(BaseModel):
    assertion_statement: bool
    authorization_date: Optional[datetime]  # Change str to datetime
    first_shipment_date: Optional[datetime]  # Change str to datetime
    new_entrant_period_start: Optional[datetime]  # Change str to datetime
    products: List[dict]  # Define products as a list of dictionaries
    emissions: List[dict]  # Define emissions as a list of dictionaries


class ReportNewEntrantSchema(BaseModel):
    id: int
    authorization_date: Optional[datetime]  # Change str to datetime
    first_shipment_date: Optional[datetime]  # Change str to datetime
    new_entrant_period_start: Optional[datetime]  # Change str to datetime
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

    authorization_date: Optional[datetime] = None
    first_shipment_date: Optional[datetime] = None
    new_entrant_period_start: Optional[datetime] = None
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
    emissions: List[EmissionSchema]  # List of EmissionSchema


class ReportNewEntrantDataOut(BaseModel):
    products: List[ProductDataSchema]  # List of ProductDataSchema
    emissions: List[dict]  # Specify the type of emissions if necessary, or use List[EmissionSchema] instead
    new_entrant_data: Optional[NewEntrantDataSchema]
