from django.core.files.base import ContentFile
from django.core.exceptions import ValidationError
from django.core.files.uploadedfile import InMemoryUploadedFile
from model_bakery import baker
from model_bakery.baker import make_recipe
from ninja import UploadedFile
import pytest
from registration.models.user import User
from reporting.models.report_attachment import ReportAttachment
from reporting.service.report_attachment_service import ReportAttachmentService


pytestmark = pytest.mark.django_db


class TestReportAttachmentService:
    """
    Testing the report attachment service
    Note: We aren't able to test the deletion of the existing file from the remote repository in this unit test suite
    """

    def setup_method(self):
        self.report_version = make_recipe("reporting.tests.utils.report_version")
        self.user = baker.make(User, app_role_id="industry_user", _fill_optional=True)

    def test_set_attachment_raises_if_file_too_large(self):
        # 20 MB + 1 byte
        file = ContentFile(b"0" * 20 * 1024 * 1024 + b"1", "test_file.txt")
        uploadedFile = UploadedFile(file, size=file.size)

        with pytest.raises(ValidationError, match='File attachment cannot exceed 20971520 bytes.'):
            ReportAttachmentService.set_attachment(
                self.report_version.id, self.user.user_guid, "verification_statement", uploadedFile
            )

    def test_set_attachment_raises_if_attachment_type_not_in_database(self):
        file = ContentFile(b"abvedseqwe", "test_file.txt")
        uploadedFile = UploadedFile(file, size=file.size)

        with pytest.raises(ValidationError, match="Value 'test_file_type_not_in_db' is not a valid choice."):
            ReportAttachmentService.set_attachment(
                self.report_version.id, self.user.user_guid, "test_file_type_not_in_db", uploadedFile
            )

    def test_get_attachments(self):
        file = ContentFile(b"abvedseqwe", "test_file.txt")
        uploadedFile1 = InMemoryUploadedFile(
            file, size=file.size, field_name='attachment', name="test_file.txt", content_type="a", charset='utf-8'
        )
        uploadedFile2 = InMemoryUploadedFile(
            file, size=file.size, field_name='attachment', name="test_file_2.txt", content_type="a", charset='utf-8'
        )

        r = ReportAttachment(
            report_version=self.report_version,
            attachment=uploadedFile1,
            attachment_type="verification_statement",
            attachment_name="some_test_file.pdf",
        )
        r.save()
        r2 = ReportAttachment(
            report_version=self.report_version,
            attachment=uploadedFile2,
            attachment_type="wci_352_362",
            attachment_name="another_test.pdf",
        )
        r2.save()

        response = ReportAttachmentService.get_attachments(self.report_version.id)
        assert list(response.all()) == [r, r2]
