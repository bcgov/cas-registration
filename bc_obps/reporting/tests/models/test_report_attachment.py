from common.tests.utils.helpers import BaseTestCase
from registration.tests.constants import TIMESTAMP_COMMON_FIELDS
from reporting.models.report_attachment import ReportAttachment
from reporting.tests.utils.immutable_report_version import (
    assert_immutable_report_version,
)
from model_bakery.baker import make_recipe, make
from reporting.tests.utils.report_rls_test_infrastructure import ReportRlsSetup
from rls.tests.helpers import assert_policies_for_cas_roles, assert_policies_for_industry_user


class ReportAttachmentTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        cls.test_object = ReportAttachment()
        cls.field_data = [
            ("id", "ID", None, None),
            *TIMESTAMP_COMMON_FIELDS,
            ("report_version", "report version", None, None),
            ("attachment", "attachment", None, None),
            ("attachment_type", "attachment type", None, None),
            ("attachment_name", "attachment name", None, None),
            ("status", "status", None, None),
        ]

    def test_immutable_after_report_version_submitted(self):
        assert_immutable_report_version("reporting.tests.utils.report_attachment")


class ReportAttachmentRlsTest(BaseTestCase):
    def test_report_attachment_rls_industry_user(self):
        # Create a report attachment for an approved user operator
        test = ReportRlsSetup()
        test_report_attachment = make(
            ReportAttachment,
            report_version=test.report_version,
            attachment='test_attachment.pdf',
            attachment_type=ReportAttachment.ReportAttachmentType.VERIFICATION_STATEMENT,
        )

        # Create a random report attachment which the user should not have access to
        random = ReportRlsSetup()
        random_report_attachment = make(
            ReportAttachment,
            report_version=random.report_version,
            attachment='random_attachment.pdf',
            attachment_type=ReportAttachment.ReportAttachmentType.VERIFICATION_STATEMENT,
        )

        def select_function(cursor):
            ReportAttachment.objects.get(id=test_report_attachment.id)

        def forbidden_select_function(cursor):
            ReportAttachment.objects.get(id=random_report_attachment.id)

        def insert_function(cursor):
            ReportAttachment.objects.create(
                report_version=test.report_version,
                attachment_name='new attachment',
                attachment='new_attachment.pdf',
                attachment_type=ReportAttachment.ReportAttachmentType.WCI_352_362,
            )

        def forbidden_insert_function(cursor):
            cursor.execute(
                """
                    INSERT INTO "erc"."report_attachment" (
                        "report_version_id", "attachment", "attachment_type", "attachment_name"
                    )
                    VALUES (%s, %s, %s, %s)
                """,
                (
                    random.report_version.id,
                    "failed_attachment.pdf",
                    ReportAttachment.ReportAttachmentType.WCI_352_362,
                    "Failed_Attachment.pdf",
                ),
            )

        def update_function(cursor):
            return ReportAttachment.objects.filter(id=test_report_attachment.id).update(
                attachment_name="Updated_Attachment.pdf"
            )

        def forbidden_update_function(cursor):
            return ReportAttachment.objects.filter(id=random_report_attachment.id).update(
                attachment_name="Updated_Attachment.pdf"
            )

        def delete_function(cursor):
            test_report_attachment.delete()

        def forbidden_delete_function(cursor):
            random_report_attachment.delete()

        assert_policies_for_industry_user(
            ReportAttachment,
            test.approved_user_operator.user,
            select_function,
            insert_function,
            update_function,
            delete_function,
            forbidden_select_function=forbidden_select_function,
            forbidden_insert_function=forbidden_insert_function,
            forbidden_update_function=forbidden_update_function,
            forbidden_delete_function=forbidden_delete_function,
        )

    def test_report_attachment_rls_cas_user(self):
        test_quantity = 5
        for i in range(test_quantity):
            facility_report = make_recipe("reporting.tests.utils.facility_report")
            make(
                ReportAttachment,
                report_version=facility_report.report_version,
                attachment=f'test_attachment_{i}.pdf',
            )

        def select_function(cursor):
            assert ReportAttachment.objects.count() == test_quantity

        assert_policies_for_cas_roles(
            ReportAttachment,
            select_function=select_function,
        )
