import dataclasses
from typing import Any, Dict, List, Literal, Optional
from ninja import Schema
from reporting.service.compliance_service.compliance_service import ComplianceData
from reporting.service.compliance_service.regulatory_values import RegulatoryValues


class RegulatoryValuesSchema(Schema):
    initial_compliance_period: int
    compliance_period: int


class ReportProductComplianceSchema(Schema):
    name: str
    unit: str
    annual_production: float
    jan_mar_production: Optional[float] = None
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

    @staticmethod
    def resolve_regulatory_values(obj: ComplianceData) -> RegulatoryValues:
        return obj.industry_regulatory_values

    @staticmethod
    def resolve_products(obj: ComplianceData) -> List[Dict[str, Any]]:
        return build_product_schemas(obj)


class EmissionsAttributableForComplianceEmissionRowSchema(Schema):
    activity: str
    source_type: str
    fuel_name: Optional[str] = None
    emissions: float


class EmissionsAttributableForComplianceUnregulatedProductRowSchema(Schema):
    product_name: str
    allocated_emissions: float


class EmissionsAttributableForComplianceTotalsSchema(Schema):
    attributable_for_reporting: float
    excluded_by_fuels: float
    non_useful_venting: float
    fugitive: float
    remaining_npnc: float
    allocated_to_unregulated_products: float
    annual_emissions_attributable_for_compliance: float
    unregulated_products_excluded_by_fuels: float
    unregulated_products_non_useful_venting: float
    unregulated_products_fugitive: float
    attributable_for_reporting_rows: List[EmissionsAttributableForComplianceEmissionRowSchema]
    excluded_by_fuels_rows: List[EmissionsAttributableForComplianceEmissionRowSchema]
    non_useful_venting_rows: List[EmissionsAttributableForComplianceEmissionRowSchema]
    fugitive_rows: List[EmissionsAttributableForComplianceEmissionRowSchema]
    remaining_npnc_rows: List[EmissionsAttributableForComplianceEmissionRowSchema]
    unregulated_product_rows: List[EmissionsAttributableForComplianceUnregulatedProductRowSchema]


class ReportProductComplianceSummarySchema(ReportProductComplianceSchema):
    allocated_for_compliance_annual: float


class ComplianceSummaryDataSchemaOut(ComplianceDataSchemaOut):
    """
    Compliance Summary page only: adds the data for the "How was this calculated?" breakdown.
    Kept separate from ComplianceDataSchemaOut, which Final Review also uses.
    """

    products: List[ReportProductComplianceSummarySchema]  # type: ignore[assignment]
    production_period: Literal["annual", "apr_dec", "jan_mar"]
    is_new_entrant: bool
    emissions_attributable_for_compliance_totals: EmissionsAttributableForComplianceTotalsSchema

    @staticmethod
    def resolve_products(obj: ComplianceData) -> List[Dict[str, Any]]:
        return build_product_schemas(obj)

    @staticmethod
    def resolve_production_period(obj: ComplianceData) -> str:
        return obj.production_period.value


def build_product_schemas(obj: ComplianceData) -> List[Dict[str, Any]]:
    """
    Transforms compliance data products into a list of dictionaries
    ready for Django Ninja to serialize into the appropriate schema.
    """
    return [
        {
            **dataclasses.asdict(p),
            "reduction_factor": float(p.reduction_factor_override or obj.industry_regulatory_values.reduction_factor),
            "tightening_rate": float(p.tightening_rate_override or obj.industry_regulatory_values.tightening_rate),
        }
        for p in obj.products
    ]
