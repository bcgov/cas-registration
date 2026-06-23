from uuid import UUID
from reporting.service.exceptions import ReportValidationException
from reporting.service.report_sign_off_service import ReportSignOffData, ReportSignOffService
from reporting.models.report_version import ReportVersion
from reporting.service.report_validation.report_validation_service import (
    ReportValidationService,
)
from reporting.signals.signals import report_submitted
from common.lib import pgtrigger
from django.db import transaction
from reporting.service.compliance_service import ComplianceService
from reporting.service.report_validation.report_validation_tags import ValidationTags
from reporting.models.report_attachment import ReportAttachment
from reporting.service.parse_verification_statement_service import ParseVerificationStatementService
import logging


logger = logging.getLogger(__name__)


class ReportSubmissionService:
    """
    A service to submit reports and handle the errors
    """

    @staticmethod
    @transaction.atomic()
    def submit_report(version_id: int, user_guid: UUID, sign_off_data: ReportSignOffData) -> ReportVersion:
        report_version = ReportVersion.objects.get(id=version_id)

        validation_result = ReportValidationService.validate_report_version(
            version_id=version_id, tag=ValidationTags.ON_SUBMIT
        )

        is_regulated_operation = report_version.report.operation.is_regulated_operation

        if validation_result:
            raise ReportValidationException(validation_result)

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

        # Parse the verification statement once at submit time.
        verification_statement = ReportAttachment.objects.filter(
            report_version_id=version_id,
            attachment_type=ReportAttachment.ReportAttachmentType.VERIFICATION_STATEMENT,
        ).first()
        if verification_statement:
            try:
                ParseVerificationStatementService.read_tables(verification_statement.attachment.path)
            except Exception:
                # Parsing failures should not block report submission.
                logger.exception(
                    "Failed to parse verification statement for report version %s",
                    version_id,
                )

        return report_version
