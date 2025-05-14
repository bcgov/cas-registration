import logging
from typing import Type, Any
from django.dispatch import receiver
from registration.signals.signals import operation_registration_purpose_changed
from reporting.models import ReportVersion
from service.report_version_service import ReportVersionService

logger = logging.getLogger(__name__)


@receiver(operation_registration_purpose_changed)
def handle_registration_purpose_changed(sender: Type[Any], **kwargs: Any) -> None:
    """
    Signal handler that deletes the draft report version for an operation
    whose registration purpose has changed.

    Args:
        sender: The class that sent the signal
        **kwargs: Signal arguments including operation_id and user_guid
    """
    operation_id = kwargs.get('operation_id')
    if not operation_id:
        logger.warning("Missing operation_id in signal kwargs")
        return

    draft_version = ReportVersion.objects.filter(
        report__operation_id=operation_id, status=ReportVersion.ReportVersionStatus.Draft
    ).first()

    if not draft_version:
        logger.info(f"No draft report version found for operation_id={operation_id}")
        return

    logger.info(f"Deleting draft report version ID={draft_version.id} for operation_id={operation_id}")
    ReportVersionService.delete_report_version(draft_version.id)
