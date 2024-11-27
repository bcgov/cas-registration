from ninja import ModelSchema, Field, Schema
from pydantic import BaseModel
from typing import Dict, Optional, List

from registration.schema.v1 import RegulatedProductSchema
from reporting.models import ReportNewEntrantProduction, ReportNewEntrant, ReportNewEntrantEmissions
from reporting.schema.emission_category import EmissionCategorySchema


class EmissionAfterNewEntrantSchema(BaseModel):
    flaring_emissions: int
    fugitive_emissions: int
    industrial_process_emissions: int
    on_site_transportation_emissions: int
    stationary_fuel_combustion_emissions: int
    venting_emissions_useful: int
    venting_emissions_non_useful: int
    emissions_from_waste: int
    emissions_from_wastewater: int


class EmissionExcludedByFuelTypeSchema(BaseModel):
    co2_emissions_from_excluded_woody_biomass: int
    other_emissions_from_excluded_biomass: int
    emissions_from_excluded_non_biomass: int


class OtherExcludedEmissionsSchema(BaseModel):
    emissions_from_line_tracing: int
    emissions_from_fat_oil: int


class ProductSchema(BaseModel):
    production_amount: int


class ReportNewEntrantSchemaIn(BaseModel):
    assertion_statement: bool
    date_of_authorization: str
    date_of_first_shipment: Optional[str]
    date_of_new_entrant_period_began: Optional[str]
    products: Dict[int, ProductSchema]
    emission_after_new_entrant: EmissionAfterNewEntrantSchema
    emission_excluded_by_fuel_type: EmissionExcludedByFuelTypeSchema
    other_excluded_emissions: OtherExcludedEmissionsSchema


class ReportNewEntrantSchema(ModelSchema):
    class Meta:
        model = ReportNewEntrant
        fields = ['id', 'authorization_date', 'first_shipment_date', 'new_entrant_period_start', 'assertion_statement']


class ReportNewEntrantProductionSchema(ModelSchema):
    class Meta:
        model = ReportNewEntrantProduction
        fields = [
            "production_amount",
        ]


class ReportNewEntrantProductionSchemaOut(ReportNewEntrantProductionSchema):
    product_id: int = Field(..., alias="product.id")
    product_name: str = Field(..., alias="product.name")
    report_new_entrant_id: int = Field(..., alias="report_new_entrant.id")
    production_amount: int


class ReportNewEntrantEmissionsSchema(ModelSchema):
    class Meta:
        model = ReportNewEntrantEmissions
        fields = [
            "emission",
        ]


class ReportNewEntrantEmissionsSchemaOut(ReportNewEntrantEmissionsSchema):
    emission_category_id: int = Field(..., alias="emission_category.id")
    category_name: str = Field(..., alias="emission_category.category_name")
    category_type: str = Field(..., alias="emission_category.category_type")


class ReportNewEntrantDataOut(Schema):
    report_new_entrant: Optional[ReportNewEntrantSchema]
    selected_products: List[ReportNewEntrantProductionSchemaOut]
    allowed_products: List[RegulatedProductSchema]
    emissions: List[ReportNewEntrantEmissionsSchemaOut]
    emission_category: List[EmissionCategorySchema]
