from typing import Optional
from compliance.models.compliance_obligation import ComplianceObligation
from compliance.models.compliance_report_version import ComplianceReportVersion
from ninja import Schema
from decimal import Decimal


class TasklistOut(Schema):
    """
    Schema for tasklist
    """

    status: ComplianceReportVersion.ComplianceStatus
    penalty_status: ComplianceObligation.PenaltyStatus
    reporting_year: int
    outstanding_balance: Optional[Decimal] = None
