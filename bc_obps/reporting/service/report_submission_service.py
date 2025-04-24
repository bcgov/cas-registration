from uuid import UUID
from django.core.exceptions import ValidationError
from django.core.exceptions import ObjectDoesNotExist
from reporting.service.report_sign_off_service import ReportSignOffData, ReportSignOffService
from reporting.models.report_verification import ReportVerification
from reporting.models.report_attachment import ReportAttachment
from reporting.models.report_version import ReportVersion
from reporting.service.report_validation.report_validation_service import (
    ReportValidationService,
)
from events.signals import report_submitted
from common.lib import pgtrigger
from django.db import transaction
from reporting.service.compliance_service import ComplianceService

from reporting.service.report_verification_service import ReportVerificationService


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
    @transaction.atomic()
    def submit_report(version_id: int, user_guid: UUID, sign_off_data: ReportSignOffData) -> ReportVersion:
        report_version = ReportVersion.objects.get(id=version_id)

        validation_result = ReportValidationService.validate_report_version(version_id)

        is_regulated_operation = report_version.report.operation.is_regulated_operation

        # The validation service now returns errors, but to not change the system behaviour,
        # we raise an error for now.
        if validation_result:
            raise ValidationError({key: val.message for key, val in validation_result.items()})

        ReportSignOffService.save_report_sign_off(version_id, sign_off_data)
        # Mark the previous latest submitted version as not latest
        with pgtrigger.ignore("reporting.ReportVersion:set_updated_audit_columns"):
            ReportVersion.objects.filter(
                report=report_version.report,
                status=ReportVersion.ReportVersionStatus.Submitted,
                is_latest_submitted=True,
            ).update(is_latest_submitted=False)

        # Save the compliance data for regulated operations (unregulated operations do not have compliance data)
        if is_regulated_operation:
            ComplianceService.save_compliance_data(version_id)

        # Set the new version as lastest submitted
        report_version.is_latest_submitted = True
        report_version.status = ReportVersion.ReportVersionStatus.Submitted
        report_version.save()

        # Send a signal that the report has been submitted
        report_submitted.send(sender=ReportSubmissionService, version_id=version_id, user_guid=user_guid)

        return report_version
