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
    Deletes the current-year draft report version for an operation whose
    registration purpose has changed.

    Skips deletion if:
    - No draft report version exists
    - The draft is for a past reporting year
    - The draft belongs to a previous operator (operation was transferred)
    """
    operation_id = kwargs.get("operation_id")
    if not operation_id:
        logger.warning("Received %s without operation_id", sender)
        return

    draft_version = (
        ReportVersion.objects.select_related("report__operation", "report__reporting_year", "report__operator")
        .filter(report__operation_id=operation_id, status=ReportVersion.ReportVersionStatus.Draft)
        .first()
    )

    if not draft_version:
        logger.info("No draft report version found for operation_id=%s", operation_id)
        return

    report = draft_version.report
    version_id = draft_version.id
    current_reporting_year = ReportingYearService.get_current_reporting_year()

    if report.reporting_year.reporting_year < current_reporting_year.reporting_year:
        logger.info(
            "Skipping deletion of draft report version id=%s for operation_id=%s: past reporting year",
            version_id,
            operation_id,
        )
        return

    if report.operation.operator_id != report.operator_id:
        logger.info(
            "Skipping deletion of draft report version id=%s for operation_id=%s: operator has changed",
            version_id,
            operation_id,
        )
        return

    logger.info("Deleting draft report version id=%s for operation_id=%s", version_id, operation_id)
    ReportVersionService.delete_report_version(version_id)
