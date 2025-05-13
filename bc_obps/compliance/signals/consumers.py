from django.dispatch import receiver
from compliance.service.compliance_summary_service import ComplianceSummaryService
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
    user_guid = kwargs.get('user_guid')

    if version_id and user_guid:

        operation = ReportVersion.objects.select_related('report__operation').get(id=version_id).report.operation
        if not operation.is_regulated_operation:
            logger.info(f"Non-regulated operation: Ignoring compliance summary for version id {version_id}")
            return
        ComplianceSummaryService.create_compliance_summary(version_id, user_guid)
