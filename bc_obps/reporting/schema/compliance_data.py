from decimal import Decimal
from ninja import Schema


class RegulatoryValueSchema(Schema):
    reduction_factor: Decimal
    tightening_rate: Decimal
    initial_compliance_period: int
    compliance_period: int


class ComplianceDataSchemaOut(Schema):
    regulatory_values: RegulatoryValueSchema
