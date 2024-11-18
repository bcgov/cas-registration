from datetime import date

from pydantic import BaseModel
from typing import Dict, Optional, List


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


class ProductOut(BaseModel):
    product_id: int
    product_name: str
    production_amount: int


class EmissionCategoryOut(BaseModel):
    id: int
    category_name: str
    category_type: str


class EmissionOut(BaseModel):
    emission_category: EmissionCategoryOut
    emission_amount: int


class ReportNewEntrantDataOut(BaseModel):
    report_version_id: int
    authorization_date: Optional[date]
    first_shipment_date: Optional[date]
    new_entrant_period_start: Optional[date]
    assertion_statement: bool
    selected_products: List[ProductOut]
    emissions: List[EmissionOut]
