from decimal import Decimal
from typing import List
from ninja import Schema


class RegulatoryValueSchema(Schema):
    reduction_factor: Decimal
    tightening_rate: Decimal
    initial_compliance_period: int
    compliance_period: int


class ReportProductComplianceSchema(Schema):
    name: str
    annual_production: Decimal | int
    apr_dec_production: Decimal | int
    emission_intensity: Decimal
    allocated_industrial_process_emissions: Decimal | int
    allocated_compliance_emissions: Decimal | int


class ComplianceDataSchemaOut(Schema):
    emissions_attributable_for_reporting: Decimal | int
    reporting_only_emissions: Decimal | int
    emissions_attributable_for_compliance: Decimal | int
    emissions_limit: Decimal | int
    excess_emissions: Decimal | int
    credited_emissions: Decimal | int
    regulatory_values: RegulatoryValueSchema
    products: List[ReportProductComplianceSchema]
