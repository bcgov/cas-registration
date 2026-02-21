from typing import List, Optional
from ninja import Schema


class RegulatoryValueSchema(Schema):
    initial_compliance_period: int
    compliance_period: int
    reduction_factor: float
    tightening_rate: float


class ReportProductComplianceSchema(Schema):
    name: str
    annual_production: float
    apr_dec_production: float
    emission_intensity: float
    allocated_industrial_process_emissions: float
    allocated_compliance_emissions: float
    reduction_factor_override: Optional[float]
    tightening_rate_override: Optional[float]


class ComplianceDataSchemaOut(Schema):
    emissions_attributable_for_reporting: float
    reporting_only_emissions: float
    emissions_attributable_for_compliance: float
    emissions_limit: float
    excess_emissions: float
    credited_emissions: float
    industry_regulatory_values: RegulatoryValueSchema
    products: List[ReportProductComplianceSchema]
    reporting_year: int
