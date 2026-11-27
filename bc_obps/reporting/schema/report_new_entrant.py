from datetime import datetime
from decimal import Decimal

from ninja import ModelSchema, Schema
from registration.models.regulated_product import RegulatedProduct
from reporting.models import ReportNewEntrant
from reporting.models.emission_category import EmissionCategory


class RegulatedProductForNewEntrant(ModelSchema):
    # In the db the type is Decimal, but without conversion here, that would show up as a string in the frontend.
    production_amount: float | None = None

    class Meta:
        model = RegulatedProduct
        fields = ["id", "name", "unit"]


class EmissionCategoryForNewEntrant(ModelSchema):
    emission: float | None = None

    class Meta:
        model = EmissionCategory
        fields = ["id", "category_name", "category_type"]


class NewEntrantDataSchema(ModelSchema):
    class Meta:
        model = ReportNewEntrant
        fields = [
            "id",
            "authorization_date",
            "first_shipment_date",
            "new_entrant_period_start",
            "assertion_statement",
        ]


class ReportNewEntrantDataOut(Schema):
    products: list[RegulatedProductForNewEntrant]
    emissions: list[EmissionCategoryForNewEntrant]
    new_entrant_data: NewEntrantDataSchema | None
    naics_code: str | None


### API In


class RegulatedProductWithAmountIn(Schema):
    production_amount: Decimal | None = None
    id: int


class EmissionCategoryWithEmissionIn(Schema):
    emission: Decimal | None = None
    id: int


class ReportNewEntrantGroupedEmissionIn(Schema):
    title: str
    emissionData: list[EmissionCategoryWithEmissionIn]


class ReportNewEntrantSchemaIn(Schema):
    products: list[RegulatedProductWithAmountIn]
    emissions: list[ReportNewEntrantGroupedEmissionIn]

    # ReportNewEntrant fields
    assertion_statement: bool
    authorization_date: datetime
    first_shipment_date: datetime
    new_entrant_period_start: datetime
