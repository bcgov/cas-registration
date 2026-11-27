from typing import Literal, Optional

from compliance.models.compliance_earned_credit import ComplianceEarnedCredit
from compliance.service.bc_carbon_registry.schema import FifteenDigitString
from ninja import Field, ModelSchema, Schema

OPERATION_NAME_ALIAS = (
    "compliance_report_version.compliance_report.report.operation.name"
)
REPORTING_YEAR_ALIAS = (
    "compliance_report_version.compliance_report.compliance_period.end_date.year"
)


class ComplianceEarnedCreditsOut(ModelSchema):
    """Schema for compliance earned credits data"""

    reporting_year: int = Field(..., alias=REPORTING_YEAR_ALIAS)
    analyst_submitted_by: str | None = Field(
        None, alias="analyst_submitted_by.get_full_name"
    )
    latest_compliance_report_version_id: int | None = Field(None)

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
            "supplementary_declined",
        ]


class ComplianceEarnedCreditsIn(Schema):
    """Schema for compliance earned credits data"""

    bccr_trading_name: str | None = (
        None  # Only required for industry users - we enforce this in the service layer
    )
    bccr_holding_account_id: FifteenDigitString | None = (
        None  # Only required for industry users - we enforce this in the service layer
    )
    analyst_suggestion: (
        Literal[
            "Ready to approve",
            "Requiring change of BCCR Holding Account ID",
            "Requiring supplementary report",
        ]
        | None
    ) = None
    analyst_comment: str | None = None
    director_comment: str | None = None
    director_decision: Literal["Approved", "Declined"] | None = None
