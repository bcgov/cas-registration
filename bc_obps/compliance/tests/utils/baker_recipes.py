from model_bakery.recipe import Recipe, foreign_key
import uuid
from django.contrib.contenttypes.models import ContentType
from compliance.models import (
    CompliancePeriod,
    ComplianceReportVersion,
    ComplianceObligation,
    ComplianceReport,
    ComplianceEarnedCredit,
)
from compliance.models.elicensing_link import ELicensingLink
from registration.models.operation import Operator
from reporting.tests.utils.baker_recipes import report, report_compliance_summary, reporting_year

# CompliancePeriod recipe
compliance_period = Recipe(
    CompliancePeriod,
    start_date="2024-01-01",
    end_date="2024-12-31",
    compliance_deadline="2025-06-30",
    reporting_year=foreign_key(reporting_year),
)

# ComplianceReport recipe
compliance_report = Recipe(
    ComplianceReport, report=foreign_key(report), compliance_period=foreign_key(compliance_period)
)

# ComplianceSummary recipe
compliance_report_version = Recipe(
    ComplianceReportVersion,
    compliance_report=foreign_key(compliance_report),
    report_compliance_summary=foreign_key(report_compliance_summary),
)

# ComplianceObligation recipe
compliance_obligation = Recipe(
    ComplianceObligation,
    compliance_report_version=foreign_key(compliance_report_version),
    penalty_status=ComplianceObligation.PenaltyStatus.NONE,
    obligation_deadline="2025-11-30",
    obligation_id="21-0001-1-1",  # Default test obligation ID in format YY-OOOO-R-V
)

# ELicensingLink recipe
elicensing_link = Recipe(
    ELicensingLink,
    elicensing_guid=uuid.uuid4(),
    elicensing_object_id="test-client-id",
    elicensing_object_kind=ELicensingLink.ObjectKind.CLIENT,
    content_type=foreign_key(Recipe(ContentType, model=Operator)),
    object_id=str(uuid.uuid4()),
    sync_status="SUCCESS",
    last_sync_at=None,
)

# ComplianceEarnedCredit recipe
compliance_earned_credit = Recipe(
    ComplianceEarnedCredit,
    compliance_report_version=foreign_key(compliance_report_version),
)
