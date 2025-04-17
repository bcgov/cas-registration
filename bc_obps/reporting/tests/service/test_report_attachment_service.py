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
from reporting.models.report_attachment_confirmation import ReportAttachmentConfirmation


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

    def test_set_attachment_with_user_data(self):
        file = ContentFile(b"abvedseqwe", "test_file.txt")
        uploadedFile = UploadedFile(file, size=file.size)

        ReportAttachmentService.set_attachment(
            self.report_version.id, self.user.user_guid, "verification_statement", uploadedFile
        )

        assert ReportAttachment.objects.count() == 1

        r = ReportAttachment.objects.first()
        assert r.attachment_type == "verification_statement"
        assert r.attachment_name == "test_file.txt"
        assert r.attachment is not None

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

    def test_get_attachment_returns_the_right_record(self):
        file = ContentFile(b"somedefinitelyrandombytes", "test_file.txt")
        uploadedFile = InMemoryUploadedFile(
            file, size=file.size, field_name='attachment', name="test_file.txt", content_type="a", charset='utf-8'
        )

        r = ReportAttachment(
            report_version=self.report_version,
            attachment=uploadedFile,
            attachment_type="verification_statement",
            attachment_name="some_test_file.pdf",
        )
        r.save()

        response = ReportAttachmentService.get_attachment(self.report_version.id, r.id)

        assert response == r

    def test_save_attachment_confirmations_creates_record_both_flags(self):
        # Act
        ReportAttachmentService.save_attachment_confirmations(
            self.report_version.id,
            confirm_required_uploaded=True,
            confirm_existing_relevant=False,
        )
        # Assert
        obj = ReportAttachmentConfirmation.objects.get(report_version_id=self.report_version.id)
        assert obj.confirm_supplementary_required_attachments_uploaded is True
        assert obj.confirm_supplementary_existing_attachments_relevant is False

    def test_save_attachment_confirmations_creates_record_one_flag(self):
        ReportAttachmentService.save_attachment_confirmations(
            self.report_version.id,
            confirm_required_uploaded=None,
            confirm_existing_relevant=True,
        )
        obj = ReportAttachmentConfirmation.objects.get(report_version_id=self.report_version.id)
        assert (
            obj.confirm_supplementary_required_attachments_uploaded is False
            or obj.confirm_supplementary_required_attachments_uploaded is None
        )
        assert obj.confirm_supplementary_existing_attachments_relevant is True

    def test_save_attachment_confirmations_updates_existing(self):
        # Pre-create confirmation
        orig = ReportAttachmentConfirmation.objects.create(
            report_version_id=self.report_version.id,
            confirm_supplementary_required_attachments_uploaded=False,
            confirm_supplementary_existing_attachments_relevant=False,
        )
        # Act: update only required_uploaded
        ReportAttachmentService.save_attachment_confirmations(
            self.report_version.id,
            confirm_required_uploaded=True,
            confirm_existing_relevant=None,
        )
        obj = ReportAttachmentConfirmation.objects.get(report_version_id=self.report_version.id)
        assert obj.id == orig.id
        assert obj.confirm_supplementary_required_attachments_uploaded is True
        assert obj.confirm_supplementary_existing_attachments_relevant is False

    def test_save_attachment_confirmations_no_op_when_no_flags(self):
        # Act
        ReportAttachmentService.save_attachment_confirmations(
            self.report_version.id,
            confirm_required_uploaded=None,
            confirm_existing_relevant=None,
        )
        # Assert no record created
        assert ReportAttachmentConfirmation.objects.filter(report_version_id=self.report_version.id).count() == 0
