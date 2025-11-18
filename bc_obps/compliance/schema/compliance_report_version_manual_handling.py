from typing import Literal, Optional

from ninja import ModelSchema, Field, Schema

from compliance.models.compliance_report_version_manual_handling import (
    ComplianceReportVersionManualHandling,
)


class ComplianceReportVersionManualHandlingOut(ModelSchema):
    """
    Schema for manual handling data associated with a compliance report version.
    """

    analyst_submitted_by: Optional[str] = Field(
        None, alias="analyst_submitted_by.get_full_name"
    )
    director_decision_by: Optional[str] = Field(
        None, alias="director_decision_by.get_full_name"
    )

    class Meta:
        model = ComplianceReportVersionManualHandling
        fields = [
            "analyst_comment",
            "analyst_submitted_date",
            "director_comment",
            "director_decision",
            "director_decision_date",
        ]


class ComplianceReportVersionManualHandlingIn(Schema):
    """
    Payload for updating manual handling data.

    - CAS Analyst:
        * Uses `analyst_comment`
    - CAS Director:
        * Uses `director_comment` and `director_decision`
    """

    analyst_comment: Optional[str] = None
    director_comment: Optional[str] = None
    director_decision: Optional[
        Literal["pending_manual_handling", "issue_resolved"]
    ] = None
