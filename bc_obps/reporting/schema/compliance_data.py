from decimal import Decimal
from typing import List
from ninja import Schema


class RegulatoryValueSchema(Schema):
    reduction_factor: Decimal
    tightening_rate: Decimal
    initial_compliance_period: int
    compliance_period: int


class ReportProductComplianceSchema(Schema):
    annual_production: Decimal | int
    apr_dec_production: Decimal | int
    emission_intensity: Decimal
    allocated_industrial_process_emissions: Decimal | int
    allocated_compliance_emissions: Decimal | int


class ComplianceDataSchemaOut(Schema):
    regulatory_values: RegulatoryValueSchema
    products: List[ReportProductComplianceSchema]
