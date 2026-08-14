from common.tests.utils.helpers import BaseTestCase
from registration.tests.constants import TIMESTAMP_COMMON_FIELDS
from reporting.tests.utils.immutable_report_version import (
    assert_immutable_report_version,
)
from reporting.tests.utils.report_data_bakers import report_raw_activity_data_baker
from reporting.models import ReportRawActivityData
from reporting.tests.utils.report_rls_test_infrastructure import ReportRlsTestSetup
from rls.tests.helpers import assert_policies_for_cas_roles, assert_policies_for_industry_user
from common.lib import pgtrigger
from model_bakery.baker import make_recipe


class ReportRawActivityDataModelTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        cls.test_object = report_raw_activity_data_baker()

        cls.field_data = [
            ("id", "ID", None, None),
            *TIMESTAMP_COMMON_FIELDS,
            ("facility_report", "facility report", None, None),
            ("activity", "activity", None, None),
            ("json_data", "json data", None, None),
            ("report_version", "report version", None, None),
        ]

    def test_immutable_after_report_version_submitted(self):
        assert_immutable_report_version(
            "reporting.tests.utils.report_raw_activity_data",
            path_to_report_version="facility_report__report_version",
        )


class ReportRawActivityDataRlsTest(BaseTestCase):

    def test_report_raw_activity_data_rls_industry_user(self):
        # Common Test Setup
        t = ReportRlsTestSetup(parent_object='facility_report')

        # ReportRawActivityData Setup
        # Inside access bounds
        with pgtrigger.ignore("reporting.ReportRawActivityData:immutable_report_version"):
            report_raw_activity_data_2010_submitted = make_recipe(
                'reporting.tests.utils.report_raw_activity_data',
                report_version=t.report_version_2010_submitted,
            )
        report_raw_activity_data_2010_draft = make_recipe(
            'reporting.tests.utils.report_raw_activity_data', report_version=t.report_version_2010_draft
        )
        # Outside access bounds
        report_raw_activity_data_2013_draft = make_recipe(
            'reporting.tests.utils.report_raw_activity_data', report_version=t.report_version_2013_draft
        )

        test_activity = make_recipe('reporting.tests.utils.activity')

        def select_function(cursor):
            ReportRawActivityData.objects.get(id=report_raw_activity_data_2010_submitted.id)

        def forbidden_select_function(cursor):
            ReportRawActivityData.objects.get(id=report_raw_activity_data_2013_draft.id)

        def insert_function(cursor):
            ReportRawActivityData.objects.create(
                report_version=t.report_version_2010_draft,
                facility_report=t.parent_object_2010_draft,
                activity=test_activity,
                json_data={"test": "start"},
            )

        def forbidden_insert_function(cursor):
            cursor.execute(
                """
                    INSERT into "erc"."report_raw_activity_data"(report_version_id)
                    values(%s)
                """,
                (t.report_version_2013_draft.id,),
            )

        def update_function(cursor):
            cursor.execute(
                """
                    UPDATE "erc"."report_raw_activity_data"
                    SET json_data = %s
                    WHERE id = %s
                """,
                ('{"test": "test"}', report_raw_activity_data_2010_draft.id),
            )
            return cursor.rowcount

        def forbidden_update_function(cursor):
            cursor.execute(
                """
                    UPDATE "erc"."report_raw_activity_data"
                    SET json_data = %s
                    WHERE id = %s
                """,
                ('{"test": "test"}', report_raw_activity_data_2013_draft.id),
            )
            return cursor.rowcount

        def delete_function(cursor):
            # Delete the report for the approved user operator
            cursor.execute(
                """
                    DELETE from "erc"."report_raw_activity_data"
                    WHERE id = %s
                """,
                (report_raw_activity_data_2010_draft.id,),
            )
            return cursor.rowcount

        def forbidden_delete_function(cursor):
            # Delete the report for the approved user operator
            cursor.execute(
                """
                    DELETE from "erc"."report_raw_activity_data"
                    WHERE id in (%s,%s)
                """,
                (report_raw_activity_data_2010_submitted.id, report_raw_activity_data_2013_draft.id),
            )
            return cursor.rowcount

        assert_policies_for_industry_user(
            ReportRawActivityData,
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

    def test_report_raw_activity_data_rls_cas_user(self):
        test_quantity = 2
        make_recipe(
            "reporting.tests.utils.report_raw_activity_data",
        )
        make_recipe(
            "reporting.tests.utils.report_raw_activity_data",
        )

        def select_function(cursor):
            assert ReportRawActivityData.objects.count() == test_quantity

        assert_policies_for_cas_roles(
            ReportRawActivityData,
            select_function=select_function,
        )
