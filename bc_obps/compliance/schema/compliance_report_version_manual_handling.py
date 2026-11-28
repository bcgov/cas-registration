from typing import Literal

from compliance.models.compliance_report_version_manual_handling import (
    ComplianceReportVersionManualHandling,
)
from ninja import Field, ModelSchema, Schema


class ComplianceReportVersionManualHandlingOut(ModelSchema):
    """
    Schema for manual handling data associated with a compliance report version.
    """

    # Project related users as full names instead of nested user objects
    analyst_submitted_by: str | None = Field(
        None, alias="analyst_submitted_by.get_full_name"
    )
    director_decision_by: str | None = Field(
        None, alias="director_decision_by.get_full_name"
    )

    class Meta:
        model = ComplianceReportVersionManualHandling
        fields = [
            "handling_type",
            "analyst_comment",
            "analyst_submitted_date",
            "director_decision",
            "director_decision_date",
        ]


class ComplianceReportVersionManualHandlingIn(Schema):
    """
    Payload for updating manual handling data.

    - CAS Analyst:
        * Uses `analyst_comment`
    - CAS Director:
        * Uses `director_decision`
    """

    analyst_comment: str | None = None
    director_decision: Literal["pending_manual_handling", "issue_resolved"] | None = (
        None
    )
