from compliance.models import ComplianceReportVersion
from compliance.models.compliance_report import ComplianceReport
from reporting.models import ReportComplianceSummary


def get_previous_compliance_version_by_report_and_summary(
    compliance_report: ComplianceReport, previous_summary: ReportComplianceSummary
) -> ComplianceReportVersion:
    return ComplianceReportVersion.objects.get(
        compliance_report=compliance_report,
        report_compliance_summary=previous_summary,
    )
