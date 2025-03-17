from decimal import Decimal
from typing import List, cast, Optional
from ninja import ModelSchema, Field
from compliance.models.compliance_product import ComplianceProduct
from compliance.models.compliance_obligation import ComplianceObligation
from compliance.models.compliance_summary import ComplianceSummary


class ComplianceProductOut(ModelSchema):
    """Schema for compliance product output"""

    product_name: str = Field(..., alias="report_product.product.name")

    class Meta:
        model = ComplianceProduct
        fields = [
            'annual_production',
            'apr_dec_production',
            'emission_intensity',
            'allocated_industrial_process_emissions',
            'allocated_compliance_emissions',
        ]


class ComplianceObligationOut(ModelSchema):
    """Schema for compliance obligation output"""

    class Meta:
        model = ComplianceObligation
        fields = [
            'emissions_amount_tco2e',
            'status',
        ]


class ComplianceSummaryListOut(ModelSchema):
    """Schema for compliance summary list output"""

    operation_name: str = Field(..., alias="report.operation.name")
    reporting_year: int = Field(..., alias="compliance_period.end_date.year")
    compliance_status: str
    obligation_id: str
    outstanding_balance: Optional[Decimal] = None

    class Meta:
        model = ComplianceSummary
        fields = [
            'id',
            'excess_emissions',
        ]


class ComplianceSummaryOut(ModelSchema):
    """Schema for compliance summary output"""

    operation_name: str = Field(..., alias="report.operation.name")
    operation_bcghg_id: str = Field(..., alias="report.operation.bcghg_id.id")
    reporting_year: int = Field(..., alias="compliance_period.end_date.year")
    compliance_status: str = Field(..., alias="compliance_status")
    products: List[ComplianceProductOut]
    obligation: ComplianceObligationOut
    excess_emissions: Decimal
    outstanding_balance: Optional[Decimal] = None
    obligation_id: str

    class Meta:
        model = ComplianceSummary
        fields = [
            'id',
            'emissions_attributable_for_reporting',
            'reporting_only_emissions',
            'emissions_attributable_for_compliance',
            'emission_limit',
            'credited_emissions',
            'reduction_factor',
            'tightening_rate',
        ]

    @staticmethod
    def resolve_excess_emissions(obj: ComplianceSummary) -> Decimal:
        return cast(Decimal, round(obj.excess_emissions))
