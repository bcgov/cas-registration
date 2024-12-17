from uuid import UUID

from reporting.models.report_attachment import ReportAttachment
from reporting.models.report_version import ReportVersion


class ReportSubmissionService:
    """
    A service to submit reports and handle the errors
    """

    @staticmethod
    def validate_report(version_id: int) -> None:
        """
        Future implementation could create a specific exception housing all the issues a report would have
        Django-ninja could then have a special way of parsing that error with a custom error code.
        """
        try:
            ReportAttachment.objects.get(
                report_version_id=version_id,
                attachment_type=ReportAttachment.ReportAttachmentType.VERIFICATION_STATEMENT,
            )
        except ReportAttachment.DoesNotExist:
            raise Exception("verification_statement")

    @staticmethod
    def submit_report(version_id: int, user_guid: UUID) -> ReportVersion:
        report_version = ReportVersion.objects.get(id=version_id)

        ReportSubmissionService.validate_report(version_id)

        report_version.set_create_or_update(user_guid)
        report_version.status = ReportVersion.ReportVersionStatus.Submitted
        report_version.save()
        return report_version
