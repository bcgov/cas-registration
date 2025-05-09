from decimal import Decimal
from typing import cast, Optional, Union
from ninja import ModelSchema, Field
from compliance.models.compliance_obligation import ComplianceObligation
from compliance.models.compliance_summary import ComplianceSummary

# Constants for field aliases
OPERATION_NAME_ALIAS = "report.operation.name"
REPORTING_YEAR_ALIAS = "compliance_period.end_date.year"


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

    operation_name: str = Field(..., alias=OPERATION_NAME_ALIAS)
    reporting_year: int = Field(..., alias=REPORTING_YEAR_ALIAS)
    compliance_status: str
    obligation_id: Optional[str] = Field(None, alias="obligation.obligation_id")
    outstanding_balance: Optional[Decimal] = None

    class Meta:
        model = ComplianceSummary
        fields = [
            'id',
            'excess_emissions',
        ]


class ComplianceSummaryOut(ModelSchema):
    """Schema for compliance summary output"""

    operation_name: str = Field(..., alias=OPERATION_NAME_ALIAS)
    operation_bcghg_id: str = Field(..., alias="report.operation.bcghg_id.id")
    reporting_year: int = Field(..., alias=REPORTING_YEAR_ALIAS)
    compliance_status: str = Field(..., alias="compliance_status")
    obligation: ComplianceObligationOut
    excess_emissions: Decimal
    outstanding_balance: Optional[Decimal] = None
    obligation_id: Optional[str] = Field(None, alias="obligation.obligation_id")

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


class ComplianceSummaryIssuanceOut(ModelSchema):
    """Schema for compliance summary issuance data"""

    operation_name: str = Field(..., alias=OPERATION_NAME_ALIAS)
    reporting_year: int = Field(..., alias=REPORTING_YEAR_ALIAS)
    excess_emissions_percentage: Optional[Union[Decimal, int]] = None
    earned_credits: Optional[int]
    earned_credits_issued: bool
    issuance_status: str

    class Meta:
        model = ComplianceSummary
        fields = [
            'id',
            'emissions_attributable_for_compliance',
            'emission_limit',
            'excess_emissions',
        ]
