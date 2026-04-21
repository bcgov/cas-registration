from django.core.files.base import ContentFile
from django.core.exceptions import ValidationError
from django.core.files.uploadedfile import InMemoryUploadedFile
from model_bakery import baker
from model_bakery.baker import make_recipe
from ninja import UploadedFile
import pytest
from registration.models.user import User
from reporting.models.report_version import ReportVersion
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

    def test_get_attachments_by_report_version(self):
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

        response = ReportAttachmentService.get_attachments_by_version(self.report_version.id)
        assert list(response.all()) == [r, r2]

    def test_get_all_attachments_filters(self):
        # ARRANGE
        rv1 = self.report_version
        rv2 = make_recipe("reporting.tests.utils.report_version")

        file = ContentFile(b"fasjdfh", "test_file.txt")

        up_file1 = InMemoryUploadedFile(
            file, size=file.size, field_name='attachment', name="test_file_1.txt", content_type='a', charset='utf-8'
        )
        up_file2 = InMemoryUploadedFile(
            file, size=file.size, field_name='attachment', name="test_file_2.txt", content_type='a', charset='utf-8'
        )

        a1 = baker.make(
            ReportAttachment,
            report_version=rv1,
            attachment=up_file1,
            attachment_type="verification_statement",
            attachment_name="test_file_1.pdf",
        )
        a2 = baker.make(
            ReportAttachment,
            report_version=rv2,
            attachment=up_file2,
            attachment_type="verification_statement",
            attachment_name="test_file_2.pdf",
        )

        a1.save()
        a2.save()
        rv1.status = ReportVersion.ReportVersionStatus.Submitted
        rv2.status = ReportVersion.ReportVersionStatus.Submitted
        rv1.save(update_fields=['status'])
        rv2.save(update_fields=['status'])

        # ACT/ASSERT
        # first try with no filters
        result = ReportAttachmentService.get_all_attachments()
        assert list(result) == [a2, a1]

        # now filter by report_version_id
        result = ReportAttachmentService.get_all_attachments(filter_params={"report_version_id": rv1.id})
        assert list(result) == [a1]

    def test_get_all_attachments_default_sort_by_report_version_id(self):
        # ARRANGE
        rv1 = self.report_version
        rv2 = make_recipe("reporting.tests.utils.report_version")

        file = ContentFile(b"fasjdfh", "test_file.txt")

        up_file1 = InMemoryUploadedFile(
            file, size=file.size, field_name='attachment', name="test_file_1.txt", content_type='a', charset='utf-8'
        )
        up_file2 = InMemoryUploadedFile(
            file, size=file.size, field_name='attachment', name="test_file_2.txt", content_type='a', charset='utf-8'
        )

        a1 = baker.make(
            ReportAttachment,
            report_version=rv1,
            attachment=up_file1,
            attachment_type="verification_statement",
            attachment_name="test_file_1.pdf",
        )
        a2 = baker.make(
            ReportAttachment,
            report_version=rv2,
            attachment=up_file2,
            attachment_type="verification_statement",
            attachment_name="test_file_2.pdf",
        )

        a1.save()
        a2.save()
        rv1.status = ReportVersion.ReportVersionStatus.Submitted
        rv2.status = ReportVersion.ReportVersionStatus.Submitted
        rv1.save(update_fields=['status'])
        rv2.save(update_fields=['status'])

        # ACT/ASSERT
        # first test default sort order (desc)
        result = list(ReportAttachmentService.get_all_attachments({}, "report_version_id", "desc"))
        assert result == sorted([a1, a2], key=lambda x: x.report_version_id, reverse=True)

        # now test ascending sort order
        result = list(ReportAttachmentService.get_all_attachments({}, "report_version_id", "asc"))
        assert result == sorted([a1, a2], key=lambda x: x.report_version_id)

    def test_get_all_attachments_sort_by_operation_name(self):
        # ARRANGE
        op_a = make_recipe("reporting.tests.utils.report_operation", operation_name="Chocolate Factory")
        op_b = make_recipe("reporting.tests.utils.report_operation", operation_name="Licorice Factory")

        rv1 = make_recipe("reporting.tests.utils.report_version", report_operation=op_a)
        rv2 = make_recipe("reporting.tests.utils.report_version", report_operation=op_b)

        file = ContentFile(b"fasjdfh", "test_file.txt")

        up_file1 = InMemoryUploadedFile(
            file, size=file.size, field_name='attachment', name="test_file_1.txt", content_type='a', charset='utf-8'
        )
        up_file2 = InMemoryUploadedFile(
            file, size=file.size, field_name='attachment', name="test_file_2.txt", content_type='a', charset='utf-8'
        )

        a1 = baker.make(
            ReportAttachment,
            report_version=rv1,
            attachment=up_file1,
            attachment_type="verification_statement",
            attachment_name="test_file_1.pdf",
        )
        a2 = baker.make(
            ReportAttachment,
            report_version=rv2,
            attachment=up_file2,
            attachment_type="verification_statement",
            attachment_name="test_file_2.pdf",
        )

        a1.save()
        a2.save()
        rv1.status = ReportVersion.ReportVersionStatus.Submitted
        rv2.status = ReportVersion.ReportVersionStatus.Submitted
        rv1.save(update_fields=['status'])
        rv2.save(update_fields=['status'])

        # ACT
        result = list(ReportAttachmentService.get_all_attachments({}, "operation", "asc"))

        # ASSERT
        assert result == [a1, a2]  # Chocolate Factory before Licorice Factory

    def test_get_all_attachments_only_returns_submitted_ones(self):
        # ARRANGE
        # need to first set status to Draft so we can still make attachments to it
        submitted_rv = make_recipe(
            "reporting.tests.utils.report_version", status=ReportVersion.ReportVersionStatus.Draft
        )
        draft_rv = make_recipe("reporting.tests.utils.report_version", status=ReportVersion.ReportVersionStatus.Draft)

        file = ContentFile(b"fasjdfh", "test_file.txt")

        up_file1 = InMemoryUploadedFile(
            file, size=file.size, field_name='attachment', name="test_file_1.txt", content_type='a', charset='utf-8'
        )
        up_file2 = InMemoryUploadedFile(
            file, size=file.size, field_name='attachment', name="test_file_2.txt", content_type='a', charset='utf-8'
        )

        a1 = baker.make(
            ReportAttachment,
            report_version=submitted_rv,
            attachment=up_file1,
            attachment_type="wci_352_362",
            attachment_name="test_file_1.pdf",
        )
        baker.make(
            ReportAttachment,
            report_version=draft_rv,
            attachment=up_file2,
            attachment_type="confidentiality_request",
            attachment_name="test_file_2.pdf",
        )

        submitted_rv.status = ReportVersion.ReportVersionStatus.Submitted
        submitted_rv.save(update_fields=['status'])

        # ACT
        result = list(ReportAttachmentService.get_all_attachments())

        # ASSERT
        assert result == [a1]

    def test_get_all_attachments_empty(self):
        result = list(ReportAttachmentService.get_all_attachments())
        assert result == []

    def test_get_all_attachments_invalid_sort_field(self):
        with pytest.raises(Exception):
            ReportAttachmentService.get_all_attachments({}, "silly_field", "desc")

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

    def test_save_attachment_confirmation_creates_record(self):
        # Act
        ReportAttachmentService.save_attachment_confirmation(
            self.report_version.id,
            confirm_required_uploaded=True,
            confirm_existing_relevant=True,
        )
        # Assert
        obj = ReportAttachmentConfirmation.objects.get(report_version_id=self.report_version.id)
        assert obj.confirm_supplementary_required_attachments_uploaded is True
        assert obj.confirm_supplementary_existing_attachments_relevant is True
