from model_bakery.baker import make_recipe
import pytest
from reporting.models.report_attachment import ReportAttachment
from reporting.service.report_validation.report_validation_error import (
    ReportValidationError,
    Severity,
)
from reporting.service.report_validation.validators.report_attachments_are_scanned import (
    validate,
)


@pytest.mark.django_db
class TestReportAttachmentsAreScannedValidator:
    def test_fails_if_attachment_is_not_scanned(self):
        report_attachment = make_recipe(
            "reporting.tests.utils.report_attachment",
            status=ReportAttachment.FileStatus.UNSCANNED,
            attachment_type=ReportAttachment.ReportAttachmentType.VERIFICATION_STATEMENT,
        )

        assert validate(report_attachment.report_version) == {
            "attachment_verification_statement": ReportValidationError(
                Severity.ERROR,
                "The verification_statement file hasn't been scanned yet, try resubmitting in a few minutes.",
            )
        }

    def test_succeeds_if_attachment_is_scanned_and_clean(self):
        report_attachment = make_recipe(
            "reporting.tests.utils.report_attachment",
            status=ReportAttachment.FileStatus.CLEAN,
            attachment_type=ReportAttachment.ReportAttachmentType.ADDITIONAL_REPORTABLE_INFORMATION,
        )

        assert not validate(report_attachment.report_version)
