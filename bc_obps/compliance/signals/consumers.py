from django.dispatch import receiver
from compliance.service.compliance_report_version_service import ComplianceReportVersionService
from compliance.service.supplementary_version_service import SupplementaryVersionService
from compliance.models import ComplianceReport, CompliancePeriod, ComplianceReportVersion
from reporting.models import ReportVersion
from reporting.signals.signals import report_submitted
from typing import Any, Type
import logging

logger = logging.getLogger(__name__)


@receiver(report_submitted)
def handle_report_submission(sender: Type[Any], **kwargs: Any) -> None:
    """
    Signal handler that creates a compliance summary when a report is submitted.

    Args:
        sender: The class that sent the signal
        **kwargs: Signal arguments including version_id and user_guid
    """
    version_id = kwargs.get('version_id')
    if not version_id:
        return

    report_version = ReportVersion.objects.select_related('report', 'report__operation').get(id=version_id)

    if report_version.report.reporting_year_id < 2024:
        logger.info("Compliance module is not enabled for reports before 2024")
        return

    if not report_version.report.operation.is_regulated_operation:
        logger.info(f"Non-regulated operation: Ignoring compliance summary for version id {version_id}")
        return

    compliance_report = get_or_create_compliance_report(report_version)

    handle_compliance_version_creation(compliance_report, report_version, version_id)


def get_or_create_compliance_report(report_version: ReportVersion) -> ComplianceReport:
    compliance_report, _ = ComplianceReport.objects.get_or_create(
        report_id=report_version.report_id,
        defaults={
            'report': report_version.report,
            'compliance_period': CompliancePeriod.objects.get(reporting_year=report_version.report.reporting_year),
        },
    )
    return compliance_report


def handle_compliance_version_creation(
    compliance_report: ComplianceReport, report_version: ReportVersion, version_id: int
) -> None:
    compliance_version_count = ComplianceReportVersion.objects.filter(compliance_report=compliance_report).count()

    if compliance_version_count > 0:
        # Handle supplementary logic if there are existing compliance report versions
        SupplementaryVersionService().handle_supplementary_version(
            compliance_report=compliance_report,
            report_version=report_version,
            version_count=compliance_version_count,
        )
    else:
        # Create a new compliance report version
        ComplianceReportVersionService.create_compliance_report_version(compliance_report.id, version_id)
