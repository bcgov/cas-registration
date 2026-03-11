import dataclasses
from typing import List
from ninja import Schema
from reporting.service.compliance_service.compliance_service import ComplianceData
from reporting.service.compliance_service.regulatory_values import RegulatoryValues


class RegulatoryValuesSchema(Schema):
    initial_compliance_period: int
    compliance_period: int


class ReportProductComplianceSchema(Schema):
    name: str
    annual_production: float
    jan_mar_production: float
    apr_dec_production: float
    emission_intensity: float
    allocated_industrial_process_emissions: float
    allocated_compliance_emissions: float
    reduction_factor: float
    tightening_rate: float


class ComplianceDataSchemaOut(Schema):
    emissions_attributable_for_reporting: float
    reporting_only_emissions: float
    emissions_attributable_for_compliance: float
    emissions_limit: float
    excess_emissions: float
    credited_emissions: float
    regulatory_values: RegulatoryValuesSchema
    products: List[ReportProductComplianceSchema]
    reporting_year: int

    @staticmethod
    def resolve_regulatory_values(obj: ComplianceData) -> RegulatoryValues:
        return obj.industry_regulatory_values

    @staticmethod
    def resolve_products(obj: ComplianceData) -> List[ReportProductComplianceSchema]:
        return list(
            map(
                lambda p: ReportProductComplianceSchema(
                    **dataclasses.asdict(p),
                    reduction_factor=float(
                        p.reduction_factor_override or obj.industry_regulatory_values.reduction_factor
                    ),
                    tightening_rate=float(p.tightening_rate_override or obj.industry_regulatory_values.tightening_rate),
                ),
                obj.products,
            )
        )
