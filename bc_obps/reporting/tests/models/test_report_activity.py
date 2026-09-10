from common.tests.utils.helpers import BaseTestCase
from registration.tests.constants import TIMESTAMP_COMMON_FIELDS
from reporting.models.activity_json_schema import ActivityJsonSchema
from reporting.models.report_activity import ReportActivity
from reporting.tests.utils.bakers import report_version_baker
from reporting.tests.utils.constants import REPORT_DATA_MODELS_COMMON_FIELDS
from model_bakery.baker import make_recipe
from reporting.tests.utils.immutable_report_version import (
    assert_immutable_report_version,
)
from reporting.tests.utils.report_rls_test_infrastructure import ReportRlsTestSetup
from rls.tests.helpers import assert_policies_for_cas_roles, assert_policies_for_industry_user
from common.lib import pgtrigger


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
        # Common Test Setup
        t = ReportRlsTestSetup(parent_object='facility_report')

        # ReportActivity Setup
        # Inside access bounds
        with pgtrigger.ignore("reporting.ReportActivity:immutable_report_version"):
            report_activity_2010_submitted = make_recipe(
                'reporting.tests.utils.report_activity', report_version=t.report_version_2010_submitted
            )
        report_activity_2010_draft = make_recipe(
            'reporting.tests.utils.report_activity', report_version=t.report_version_2010_draft
        )
        # Outside access bounds
        report_activity_2013_draft = make_recipe(
            'reporting.tests.utils.report_activity', report_version=t.report_version_2013_draft
        )

        def select_function(cursor):
            ReportActivity.objects.get(id=report_activity_2010_submitted.id)

        def forbidden_select_function(cursor):
            ReportActivity.objects.get(id=report_activity_2013_draft.id)

        def insert_function(cursor):
            ReportActivity.objects.create(
                report_version=t.report_version_2010_draft,
                facility_report_id=t.parent_object_2010_draft.id,
                activity_base_schema_id=1,
                activity_id=1,
                json_data={},
            )

        def forbidden_insert_function(cursor):
            cursor.execute(
                """
                    INSERT into "erc"."report_activity"(report_version_id, facility_report_id, activity_base_schema_id, activity_id, json_data )
                    values(%s, %s, %s, %s, %s)
                """,
                (
                    report_activity_2013_draft.id,
                    t.parent_object_2013_draft.id,
                    1,
                    1,
                    '{}',
                ),
            )

        def update_function(cursor):
            cursor.execute(
                """
                    UPDATE "erc"."report_activity"
                    SET activity_id = %s
                    WHERE id = %s
                """,
                (999, report_activity_2010_draft.id),
            )
            return cursor.rowcount

        def forbidden_update_function(cursor):
            cursor.execute(
                """
                    UPDATE "erc"."report_activity"
                    SET activity_id = %s
                    WHERE id = %s
                """,
                (999, report_activity_2013_draft.id),
            )
            return cursor.rowcount

        def delete_function(cursor):
            # Delete the report for the approved user operator
            cursor.execute(
                """
                    DELETE from "erc"."report_activity"
                    WHERE id = %s
                """,
                (report_activity_2010_draft.id,),
            )
            return cursor.rowcount

        def forbidden_delete_function(cursor):
            # Delete the report for the approved user operator
            cursor.execute(
                """
                    DELETE from "erc"."report_activity"
                    WHERE id in (%s,%s)
                """,
                (report_activity_2010_submitted.id, report_activity_2013_draft.id),
            )
            return cursor.rowcount

        assert_policies_for_industry_user(
            ReportActivity,
            t.approved_user_operator.user,
            select_function=select_function,
            insert_function=insert_function,
            update_function=update_function,
            delete_function=delete_function,
            forbidden_select_function=forbidden_select_function,
            forbidden_insert_function=forbidden_insert_function,
            forbidden_update_function=forbidden_update_function,
            forbidden_delete_function=forbidden_delete_function,
        )

    def test_report_activity_rls_cas_user(self):
        test_quantity = 2
        make_recipe(
            "reporting.tests.utils.report_activity",
        )
        make_recipe(
            "reporting.tests.utils.report_activity",
        )

        def select_function(cursor):
            assert ReportActivity.objects.count() == test_quantity

        assert_policies_for_cas_roles(
            ReportActivity,
            select_function=select_function,
        )
