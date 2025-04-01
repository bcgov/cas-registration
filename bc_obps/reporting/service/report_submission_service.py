from uuid import UUID
from django.core.exceptions import ValidationError
from reporting.service.report_sign_off_service import ReportSignOffService
from reporting.schema.report_sign_off import ReportSignOffIn
from reporting.models.report_version import ReportVersion
from reporting.service.report_validation.report_validation_service import (
    ReportValidationService,
)
from events.signals import report_submitted
from common.lib import pgtrigger
from django.db import transaction


class ReportSubmissionService:
    """
    A service to submit reports and handle the errors
    """

    @staticmethod
    @transaction.atomic()
    def submit_report(version_id: int, user_guid: UUID, sign_off_data: ReportSignOffIn) -> ReportVersion:
        report_version = ReportVersion.objects.get(id=version_id)

        validation_result = ReportValidationService.validate_report_version(version_id)

        # The validation service now returns errors, but to not change the system behaviour,
        # we raise an error for now.
        for error_key, error in validation_result.items():
            raise ValidationError(error_key)

        ReportSignOffService.save_report_sign_off(version_id, sign_off_data)
        # Mark the previous latest submitted version as not latest
        with pgtrigger.ignore("reporting.ReportVersion:set_updated_audit_columns"):
            ReportVersion.objects.filter(
                report=report_version.report,
                status=ReportVersion.ReportVersionStatus.Submitted,
                is_latest_submitted=True,
            ).update(is_latest_submitted=False)

        # Set the new version as lastest submitted
        report_version.is_latest_submitted = True
        report_version.status = ReportVersion.ReportVersionStatus.Submitted
        report_version.save()

        # Send a signal that the report has been submitted
        report_submitted.send(sender=ReportSubmissionService, version_id=version_id, user_guid=user_guid)

        return report_version
