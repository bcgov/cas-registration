from uuid import UUID
from django.core.exceptions import ObjectDoesNotExist
from reporting.models.report_verification import ReportVerification
from reporting.models.report_attachment import ReportAttachment
from reporting.models.report_version import ReportVersion
from reporting.service.report_verification_service import ReportVerificationService
from events.signals import report_submitted


class ReportSubmissionService:
    """
    A service to submit reports and handle the errors
    """

    @staticmethod
    def validate_report(version_id: int) -> None:
        """
        Future implementation could create a specific exception housing all the issues a report would have
        Django-ninja could then have a special way of parsing that error with a custom error code.

        Validates that the report meets necessary requirements before submission:
        - If report verification is required, ensures that a `ReportVerification` entry exists.
        - If a verification statement is required, ensures the presence of a corresponding attachment.
        """
        try:
            # Check if verification is mandatory
            isVerificationMandatory = ReportVerificationService.get_report_needs_verification(version_id)

            if isVerificationMandatory:
                # Check for the ReportVerification entry
                try:
                    ReportVerification.objects.get(report_version_id=version_id)  # attempt to get the object.
                except ObjectDoesNotExist:
                    raise Exception("missing_report_verification")

                # Check for the attachment only if mandatory
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

        # Mark the previous latest submitted version as not latest
        ReportVersion.objects.filter(
            report=report_version.report,
            status=ReportVersion.ReportVersionStatus.Submitted,
            is_latest_submitted=True,
        ).update(is_latest_submitted=False)

        # Set the new version as lastest submitted and the latest
        report_version.is_latest_submitted = True
        report_version.status = ReportVersion.ReportVersionStatus.Submitted
        report_version.save()

        # Send a signal that the report has been submitted
        report_submitted.send(sender=ReportSubmissionService, version_id=version_id, user_guid=user_guid)

        return report_version
