from django.dispatch import receiver
from compliance.service.compliance_report_version_service import ComplianceReportVersionService
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

        operation = ReportVersion.objects.select_related('report__operation').get(id=version_id).report.operation
        if not operation.is_regulated_operation:
            logger.info(f"Non-regulated operation: Ignoring compliance summary for version id {version_id}")
            return
        ComplianceReportVersionService.create_compliance_report_version(version_id)
