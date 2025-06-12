from common.tests.utils.helpers import BaseTestCase
from django.db import ProgrammingError
import pytest
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
        number_of_accesible_records = ReportAttachment.objects.filter(report_version=test.report_version).count()

        # Create a random report attachment which the user should not have access to
        random = ReportRlsSetup()
        random_report_attachment = make(
            ReportAttachment,
            report_version=random.report_version,
            attachment='random_attachment.pdf',
            attachment_type=ReportAttachment.ReportAttachmentType.VERIFICATION_STATEMENT,
        )
        number_of_total_records = ReportAttachment.objects.count()

        def select_function(cursor):
            # Selects the report attachment for the approved user operator and not the random attachment
            assert ReportAttachment.objects.count() < number_of_total_records
            assert ReportAttachment.objects.count() == number_of_accesible_records
            assert ReportAttachment.objects.filter(report_version=random.report_version).count() == 0

        def insert_function(cursor):
            new_report_attachment = make(
                ReportAttachment,
                report_version=test.report_version,
                attachment='new_attachment.pdf',
                attachment_type=ReportAttachment.ReportAttachmentType.WCI_352_362,
            )
            number_of_accesible_records_after_insert = number_of_accesible_records + 1

            assert ReportAttachment.objects.count() == number_of_accesible_records_after_insert
            assert new_report_attachment.id is not None
            # Attempt to insert a report attachment for a report that the user is not an operator for
            with pytest.raises(
                ProgrammingError, match='new row violates row-level security policy for table "report_attachment"'
            ):
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
            test_report_attachment.attachment_name = "Updated_Attachment.pdf"
            test_report_attachment.save()
            assert (
                ReportAttachment.objects.get(id=test_report_attachment.id).attachment_name == "Updated_Attachment.pdf"
            )
            # Attempt to update a report attachment that the user should not have access to
            cursor.execute(
                """
                    UPDATE "erc"."report_attachment"
                    SET "attachment_name" = %s
                    WHERE "report_version_id" = %s
                """,
                ("Failed_Updated_Attachment.pdf", random.report_version.id),
            )
            assert cursor.rowcount == 0  # No rows should be updated

        def delete_function(cursor):
            assert (
                ReportAttachment.objects.filter(report_version=test.report_version).count()
                == number_of_accesible_records
            )
            # Delete the report attachment for the approved user operator
            number_of_deleted_report_attachments, _ = test_report_attachment.delete()

            assert number_of_deleted_report_attachments > 0
            assert (
                ReportAttachment.objects.filter(report_version=test.report_version).count()
                == number_of_accesible_records - number_of_deleted_report_attachments
            )

            # Attempt to delete a report attachment that the user should not have access to
            number_of_deleted_report_attachments, _ = random_report_attachment.delete()
            assert number_of_deleted_report_attachments == 0

        assert_policies_for_industry_user(
            ReportAttachment,
            test.approved_user_operator.user,
            select_function,
            insert_function,
            update_function,
            delete_function,
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

        def select_function(cursor, i):
            assert ReportAttachment.objects.count() == test_quantity

        assert_policies_for_cas_roles(
            ReportAttachment,
            select_function=select_function,
        )
