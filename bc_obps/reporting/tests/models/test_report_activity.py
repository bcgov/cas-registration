from common.tests.utils.helpers import BaseTestCase
from django.db import ProgrammingError
import pytest
from registration.tests.constants import TIMESTAMP_COMMON_FIELDS
from reporting.models import report
from reporting.models.activity_json_schema import ActivityJsonSchema
from reporting.models.report_activity import ReportActivity
from reporting.tests.utils.bakers import report_version_baker
from reporting.tests.utils.constants import REPORT_DATA_MODELS_COMMON_FIELDS
from model_bakery.baker import make_recipe
from reporting.tests.utils.immutable_report_version import (
    assert_immutable_report_version,
)
from reporting.tests.utils.rls_test_recipe import ReportRlsSetup
from rls.tests.helpers import test_policies_for_cas_roles, test_policies_for_industry_user


class ReportActivityModelTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        report_version = report_version_baker()

        cls.test_object = ReportActivity.objects.create(
            report_version=report_version,
            json_data="{'test': 1}",
            activity_base_schema=ActivityJsonSchema.objects.first(),
            activity=ActivityJsonSchema.objects.first().activity,
            facility_report=make_recipe("reporting.tests.utils.facility_report"),
        )
        cls.field_data = [
            *TIMESTAMP_COMMON_FIELDS,
            *REPORT_DATA_MODELS_COMMON_FIELDS,
            ("activity_base_schema", "activity base schema", None, None),
            ("activity", "activity", None, None),
            ("reportsourcetype_records", "report source type", None, 0),
            ("facility_report", "facility report", None, None),
        ]

    def test_immutable_after_report_version_submitted(self):
        assert_immutable_report_version("reporting.tests.utils.report_activity")

class ReportActivityRlsTest(BaseTestCase):

    def test_report_activity_rls_industry_user(self):
        test = ReportRlsSetup()
        report_activity = make_recipe(
            "reporting.tests.utils.report_activity",
            facility_report=test.facility_report,
            report_version=test.report_version,
        )
        number_of_accessible_records = ReportActivity.objects.filter(report_version=test.report_version).count()
        random = ReportRlsSetup()
        random_report_activity = make_recipe(
            "reporting.tests.utils.report_activity",
            facility_report=random.facility_report,
            report_version=random.report_version,
        )

        number_of_total_records = ReportActivity.objects.count()

        def select_function(cursor):
            assert ReportActivity.objects.count() < number_of_total_records
            assert ReportActivity.objects.count() == number_of_accessible_records
            assert ReportActivity.objects.filter(report_version=random.report_version).count() == 0

        def insert_function(cursor):
            new_report_activity = make_recipe(
                "reporting.tests.utils.report_activity",
                facility_report=test.facility_report,
                report_version=test.report_version,
            )
            assert ReportActivity.objects.count() == number_of_accessible_records + 1
            assert ReportActivity.objects.filter(id=new_report_activity.id).exists()
            # Attempt to insert a report activity for a report that the user is not an operator for
            with pytest.raises(
                ProgrammingError, match='new row violates row-level security policy for table "report_activity"'
            ):
                cursor.execute(
                    """
                    INSERT INTO "erc"."report_activity" (
                        "report_version_id", "facility_report_id", "activity_id", "activity_base_schema_id"
                    )
                    VALUES (%s, %s, %s, %s)
                """,
                    (
                        random.report_version.id,
                        random.facility_report.id,
                        report_activity.activity.id,
                        report_activity.activity_base_schema.id,
                    ),
                )

        def update_function(cursor):
            new_data = "{'test': 42}"
            report_activity.json_data = new_data
            report_activity.save()
            assert ReportActivity.objects.filter(id=report_activity.id).json_data == new_data
            # Attempt to update a report activity that the user should not have access to
            cursor.execute(
                """
                UPDATE "erc"."report_activity"
                SET "json_data" = %s
                WHERE "id" = %s
            """,
                (new_data, random_report_activity.id),
            )
            assert cursor.rowcount == 0

        def delete_function(cursor):
            assert (
                ReportActivity.objects.filter(report_version=test.report_version).count()
                == number_of_accessible_records
            )
            # Delete the test report activity
            number_of_deleted_report_attachments, _ = report_activity.delete()
            assert number_of_deleted_report_attachments == 1
            assert (
                ReportActivity.objects.filter(report_version=test.report_version).count()
                == number_of_accessible_records - 1
            )
            # Attempt to delete a report activity that the user should not have access to
            number_of_deleted_report_attachments, _ = random_report_activity.delete()
            assert number_of_deleted_report_attachments == 0

        test_policies_for_industry_user(ReportActivity, test.approved_user_operator.user, select_function, insert_function, update_function, delete_function)

    def test_report_activity_rls_cas_user(self):
        test_quantity = 5
        make_recipe(
            "reporting.tests.utils.report_activity",
            _quantity=test_quantity,
        )

        def select_function(cursor):
            assert ReportActivity.objects.count() == test_quantity

        test_policies_for_cas_roles(
            ReportActivity,
            select_function=select_function,
        )
