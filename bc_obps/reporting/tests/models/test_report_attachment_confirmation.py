from common.tests.utils.helpers import BaseTestCase
from reporting.models.report_attachment_confirmation import ReportAttachmentConfirmation
from reporting.models.report_version import ReportVersion
from reporting.tests.utils.immutable_report_version import assert_immutable_report_version

class ReportAttachmentConfirmationTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        # Create a ReportVersion instance for testing
        cls.report_version = ReportVersion.objects.create(
            # Add necessary fields for ReportVersion
        )
        # Create a ReportAttachmentConfirmation instance linked to the ReportVersion
        cls.test_object = ReportAttachmentConfirmation.objects.create(
            report_version=cls.report_version,
            confirm_supplementary_required_attachments_uploaded=True,
            confirm_supplementary_existing_attachments_relevant=False,
        )
        # Define field data for validation
        cls.field_data = [
            ("id", "ID", None, None),
            ("report_version", "report version", None, None),
            ("confirm_supplementary_required_attachments_uploaded", "confirm supplementary required attachments uploaded", None, None),
            ("confirm_supplementary_existing_attachments_relevant", "confirm supplementary existing attachments relevant", None, None),
        ]

    def test_immutable_after_report_version_submitted(self):
        # Use the provided utility to assert immutability
        assert_immutable_report_version("reporting.tests.utils.report_attachment_confirmation")
