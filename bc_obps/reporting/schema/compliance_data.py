from decimal import Decimal
from typing import List
from ninja import Schema


class RegulatoryValueSchema(Schema):
    initial_compliance_period: int
    compliance_period: int


class ReportProductComplianceSchema(Schema):
    name: str
    annual_production: float
    jan_mar_production: float
    apr_dec_production: float
    emission_intensity: Decimal
    allocated_industrial_process_emissions: float
    allocated_compliance_emissions: float
    reduction_factor: Decimal
    tightening_rate: Decimal


class ComplianceDataSchemaOut(Schema):
    emissions_attributable_for_reporting: float
    reporting_only_emissions: float
    emissions_attributable_for_compliance: float
    emissions_limit: float
    excess_emissions: float
    credited_emissions: float
    regulatory_values: RegulatoryValueSchema
    products: List[ReportProductComplianceSchema]
    reporting_year: int
