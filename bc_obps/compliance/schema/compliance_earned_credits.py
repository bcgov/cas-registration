from typing import Literal, Optional
from compliance.service.bc_carbon_registry.schema import FifteenDigitString
from ninja import ModelSchema, Field, Schema
from compliance.models.compliance_earned_credit import ComplianceEarnedCredit

OPERATION_NAME_ALIAS = "compliance_report_version.compliance_report.report.operation.name"
REPORTING_YEAR_ALIAS = "compliance_report_version.compliance_report.compliance_period.end_date.year"


class ComplianceEarnedCreditsOut(ModelSchema):
    """Schema for compliance earned credits data"""

    reporting_year: int = Field(..., alias=REPORTING_YEAR_ALIAS)
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

    bccr_trading_name: Optional[str] = None  # Only required for industry users - we enforce this in the service layer
    bccr_holding_account_id: Optional[
        FifteenDigitString
    ] = None  # Only required for industry users - we enforce this in the service layer
    analyst_suggestion: Optional[
        Literal["Ready to approve", "Requiring change of BCCR Holding Account ID", "Requiring supplementary report"]
    ] = None
    analyst_comment: Optional[str] = None
    director_comment: Optional[str] = None
    director_decision: Optional[Literal["Approved", "Declined"]] = None
