from ninja import Schema
from pydantic import BaseModel
from typing import Dict, Optional, List

from registration.schema.v1 import RegulatedProductSchema


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


class ReportNewEntrantSchemaOut(BaseModel):
    authorization_date: Optional[str] = None
    first_shipment_date: Optional[str] = None
    new_entrant_period_start: Optional[str] = None
    assertion_statement: Optional[bool] = None
    flaring_emissions: Optional[int] = None
    fugitive_emissions: Optional[int] = None
    industrial_process_emissions: Optional[int] = None
    on_site_transportation_emissions: Optional[int] = None
    stationary_fuel_combustion_emissions: Optional[int] = None
    venting_emissions_useful: Optional[int] = None
    venting_emissions_non_useful: Optional[int] = None
    emissions_from_waste: Optional[int] = None
    emissions_from_wastewater: Optional[int] = None
    co2_emissions_from_excluded_woody_biomass: Optional[int] = None
    other_emissions_from_excluded_biomass: Optional[int] = None
    emissions_from_excluded_non_biomass: Optional[int] = None
    emissions_from_line_tracing: Optional[int] = None
    emissions_from_fat_oil: Optional[int] = None
    selected_products: Optional[List[Dict[int, Dict[str, int]]]] = None


class ReportNewEntrantDataOut(Schema):
    regulated_products: List[RegulatedProductSchema]
    report_new_entrant_data: ReportNewEntrantSchemaOut
