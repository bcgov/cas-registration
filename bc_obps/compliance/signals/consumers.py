from django.dispatch import receiver
from compliance.service.compliance_report_version_service import ComplianceReportVersionService
from compliance.service.supplementary_version_service import SupplementaryVersionService
from compliance.models import ComplianceReport, CompliancePeriod
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

    if version_id:
        report_version = ReportVersion.objects.select_related('report', 'report__operation').get(id=version_id)
        if not report_version.report.operation.is_regulated_operation:
            logger.info(f"Non-regulated operation: Ignoring compliance summary for version id {version_id}")
            return
        if not (
            ComplianceReport.objects.filter(
                report_id=report_version.report_id,
            )
        ).exists():
            ComplianceReport.objects.create(
                report=report_version.report,
                compliance_period=CompliancePeriod.objects.get(reporting_year=report_version.report.reporting_year),
            )
        compliance_report = ComplianceReport.objects.get(report_id=report_version.report_id)
        # Handle supplementary logic if the emission report_version is supplementary
        version_count = ReportVersion.objects.filter(report_id=report_version.report_id).count()
        if version_count > 1:
            SupplementaryVersionService.handle_supplementary_version(
                compliance_report=compliance_report,
                report_version=report_version,
                version_count=version_count,
            )
        else:
            ComplianceReportVersionService.create_compliance_report_version(compliance_report, version_id)
