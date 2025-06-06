from typing import Optional
from decimal import Decimal
from ninja import ModelSchema, Field
from compliance.models.compliance_earned_credit import ComplianceEarnedCredit

OPERATION_NAME_ALIAS = "compliance_report_version.compliance_report.report.operation.name"
REPORTING_YEAR_ALIAS = "compliance_report_version.compliance_report.compliance_period.end_date.year"
EMISSIONS_ATTRIBUTABLE_ALIAS = (
    "compliance_report_version.report_compliance_summary.emissions_attributable_for_compliance"
)
EMISSIONS_LIMIT_ALIAS = "compliance_report_version.report_compliance_summary.emissions_limit"
EXCESS_EMISSIONS_ALIAS = "compliance_report_version.report_compliance_summary.excess_emissions"


class ComplianceEarnedCreditsOut(ModelSchema):
    """Schema for compliance earned credits data"""

    operation_name: str = Field(..., alias=OPERATION_NAME_ALIAS)
    reporting_year: int = Field(..., alias=REPORTING_YEAR_ALIAS)
    emissions_attributable_for_compliance: Optional[Decimal] = Field(None, alias=EMISSIONS_ATTRIBUTABLE_ALIAS)
    emission_limit: Optional[Decimal] = Field(None, alias=EMISSIONS_LIMIT_ALIAS)
    excess_emissions: Optional[Decimal] = Field(None, alias=EXCESS_EMISSIONS_ALIAS)
    earned_credits_issued: bool = False

    class Meta:
        model = ComplianceEarnedCredit
        fields = [
            "id",
            "earned_credits_amount",
            "issuance_status",
            "bccr_trading_name",
            "analyst_comment",
            "director_comment",
        ]

    @staticmethod
    def resolve_earned_credits_issued(obj: ComplianceEarnedCredit) -> bool:
        """Determine if earned credits have been issued"""
        return obj.issuance_status == ComplianceEarnedCredit.IssuanceStatus.CREDITS_ISSUED
