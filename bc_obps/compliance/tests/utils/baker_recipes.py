from model_bakery.recipe import Recipe, foreign_key
from compliance.models import CompliancePeriod, ComplianceReportVersion, ComplianceObligation, ComplianceReport
from reporting.tests.utils.baker_recipes import report, report_version, report_compliance_summary
from reporting.models import ReportingYear
from registration.tests.utils.baker_recipes import operation

# CompliancePeriod recipe
compliance_period = Recipe(
    CompliancePeriod,
    start_date="2024-01-01",
    end_date="2024-12-31",
    compliance_deadline="2025-06-30",
    reporting_year=foreign_key(Recipe(ReportingYear)),
)

# ComplianceReport recipe
compliance_report = Recipe(
    ComplianceReport,
    report=foreign_key(report),
    compliance_period=foreign_key(compliance_period),
    operation=foreign_key(operation),
)

# ComplianceSummary recipe
compliance_report_version = Recipe(
    ComplianceReportVersion,
    compliance_report=foreign_key(compliance_report),
    report_version=foreign_key(report_version),
    report_compliance_summary=foreign_key(report_compliance_summary),
)

# ComplianceObligation recipe
compliance_obligation = Recipe(
    ComplianceObligation,
    compliance_summary=foreign_key(compliance_report_version),
    penalty_status=ComplianceObligation.PenaltyStatus.NONE,
    obligation_deadline="2025-11-30",
    obligation_id="21-0001-1-1",  # Default test obligation ID in format YY-OOOO-R-V
)
