from datetime import datetime
from decimal import Decimal
from ninja import ModelSchema, Schema
from typing import Optional, List

from registration.models.regulated_product import RegulatedProduct
from reporting.models import ReportNewEntrant
from reporting.models.emission_category import EmissionCategory


class RegulatedProductForNewEntrant(ModelSchema):
    production_amount: Optional[Decimal]

    class Meta:
        model = RegulatedProduct
        fields = ['id', 'name', 'unit']


class EmissionCategoryForNewEntrant(ModelSchema):
    emission: Optional[Decimal]

    class Meta:
        model = EmissionCategory
        fields = ['id', 'category_name', 'category_type']


class NewEntrantDataSchema(ModelSchema):
    class Meta:
        model = ReportNewEntrant
        fields = ["id", "authorization_date", "first_shipment_date", "new_entrant_period_start", "assertion_statement"]


class ReportNewEntrantDataOut(Schema):
    products: List[RegulatedProductForNewEntrant]
    emissions: List[EmissionCategoryForNewEntrant]
    new_entrant_data: Optional[NewEntrantDataSchema]
    naics_code: Optional[str]


### API In


class RegulatedProductWithAmountIn(Schema):
    production_amount: Optional[Decimal] = None
    id: int


class EmissionCategoryWithEmissionIn(Schema):
    emission: Optional[Decimal] = None
    id: int


class ReportNewEntrantGroupedEmissionIn(Schema):
    title: str
    emissionData: List[EmissionCategoryWithEmissionIn]


class ReportNewEntrantSchemaIn(Schema):
    products: List[RegulatedProductWithAmountIn]
    emissions: List[ReportNewEntrantGroupedEmissionIn]

    # ReportNewEntrant fields
    assertion_statement: bool
    authorization_date: datetime
    first_shipment_date: datetime
    new_entrant_period_start: datetime
