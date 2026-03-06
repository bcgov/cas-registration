import logging
from typing import Type, Any
from django.dispatch import receiver
from registration.signals.signals import operation_registration_purpose_changed
from reporting.models import ReportVersion
from service.report_version_service import ReportVersionService
from service.reporting_year_service import ReportingYearService

logger = logging.getLogger(__name__)


@receiver(operation_registration_purpose_changed)
def handle_registration_purpose_changed(sender: Type[Any], **kwargs: Any) -> None:
    """
    Signal handler that deletes the draft report version for an operation
    whose registration purpose has changed.

    Skips deletion if:
    - No draft report version exists for the current reporting year
    - The draft belongs to a previous operator (operation was transferred)
    """
    operation_id = kwargs.get("operation_id")
    if not operation_id:
        logger.warning("Signal received without operation_id in kwargs")
        return

    current_reporting_year = ReportingYearService.get_current_reporting_year()

    draft_version = (
        ReportVersion.objects.select_related("report__operation", "report__reporting_year", "report__operator")
        .filter(
            report__operation_id=operation_id,
            status=ReportVersion.ReportVersionStatus.Draft,
            report__reporting_year=current_reporting_year,
        )
        .first()
    )

    if not draft_version:
        logger.info("No draft report version found for operation_id=%s", operation_id)
        return

    report = draft_version.report
    version_id = draft_version.id

    if report.operation.operator_id != report.operator_id:
        logger.info(
            "Skipping deletion of draft report version id=%s for operation_id=%s: operator has changed",
            version_id,
            operation_id,
        )
        return

    logger.info("Deleting draft report version id=%s for operation_id=%s", version_id, operation_id)
    ReportVersionService.delete_report_version(version_id)
