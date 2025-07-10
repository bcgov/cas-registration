from typing import Literal, Optional
from decimal import Decimal
from compliance.service.bc_carbon_registry.schema import FifteenDigitString
from ninja import ModelSchema, Field, Schema
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

    reporting_year: int = Field(..., alias=REPORTING_YEAR_ALIAS)
    emissions_attributable_for_compliance: Optional[Decimal] = Field(None, alias=EMISSIONS_ATTRIBUTABLE_ALIAS)
    emissions_limit: Optional[Decimal] = Field(None, alias=EMISSIONS_LIMIT_ALIAS)
    excess_emissions: Optional[Decimal] = Field(None, alias=EXCESS_EMISSIONS_ALIAS)
    analyst_submitted_by: Optional[str] = Field(None, alias="analyst_submitted_by.get_full_name")

    class Meta:
        model = ComplianceEarnedCredit
        fields = [
            "earned_credits_amount",
            "issuance_status",
            "bccr_trading_name",
            "bccr_holding_account_id",
            "analyst_comment",
            "director_comment",
            "analyst_submitted_date",
            "analyst_suggestion",
        ]


class ComplianceEarnedCreditsIn(Schema):
    """Schema for compliance earned credits data"""

    bccr_trading_name: str
    bccr_holding_account_id: FifteenDigitString
    analyst_suggestion: Optional[
        Literal["Ready to approve", "Requiring change of BCCR Holding Account ID", "Requiring supplementary report"]
    ] = None
    analyst_comment: Optional[str] = None
    director_comment: Optional[str] = None
    director_decision: Optional[Literal["Approved", "Declined"]] = None
