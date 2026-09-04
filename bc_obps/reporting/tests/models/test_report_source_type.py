from common.tests.utils.helpers import BaseTestCase
from registration.tests.constants import TIMESTAMP_COMMON_FIELDS
from reporting.tests.utils.constants import REPORT_DATA_MODELS_COMMON_FIELDS
from reporting.tests.utils.immutable_report_version import (
    assert_immutable_report_version,
)
from reporting.tests.utils.report_data_bakers import report_source_type_baker
from reporting.models import ReportSourceType
from reporting.tests.utils.report_rls_test_infrastructure import ReportRlsTestSetup
from rls.tests.helpers import assert_policies_for_cas_roles, assert_policies_for_industry_user
from common.lib import pgtrigger
from model_bakery.baker import make_recipe


class ReportSourceTypeModelTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        cls.test_object = report_source_type_baker()
        cls.field_data = [
            *TIMESTAMP_COMMON_FIELDS,
            *REPORT_DATA_MODELS_COMMON_FIELDS,
            (
                "activity_source_type_base_schema",
                "activity source type base schema",
                None,
                None,
            ),
            ("source_type", "source type", None, None),
            ("report_activity", "report activity", None, None),
            ("reportunit_records", "report unit", None, 0),
            ("reportfuel_records", "report fuel", None, 0),
            ("reportemission_records", "report emission", None, 0),
        ]

    def test_immutable_after_report_version_submitted(self):
        assert_immutable_report_version("reporting.tests.utils.report_source_type")


class ReportSourceTypeRlsTest(BaseTestCase):

    def test_report_source_type_rls_industry_user(self):
        # Common Test Setup
        t = ReportRlsTestSetup('report_activity')

        # ReportSourceType Setup
        # Inside access bounds
        with pgtrigger.ignore("reporting.ReportSourceType:immutable_report_version"):
            report_source_type_2010_submitted = make_recipe(
                'reporting.tests.utils.report_source_type',
                report_version=t.report_version_2010_submitted,
            )
        report_source_type_2010_draft = make_recipe(
            'reporting.tests.utils.report_source_type', report_version=t.report_version_2010_draft
        )
        # Outside access bounds
        report_source_type_2013_draft = make_recipe(
            'reporting.tests.utils.report_source_type', report_version=t.report_version_2013_draft
        )

        def select_function(cursor):
            ReportSourceType.objects.get(id=report_source_type_2010_submitted.id)

        def forbidden_select_function(cursor):
            ReportSourceType.objects.get(id=report_source_type_2013_draft.id)

        test_schema = make_recipe('reporting.tests.utils.activity_source_type_json_schema')
        test_source_type = make_recipe('reporting.tests.utils.source_type')

        def insert_function(cursor):
            ReportSourceType.objects.create(
                report_version=t.report_version_2010_draft,
                report_activity=t.parent_object_2010_draft,
                activity_source_type_base_schema=test_schema,
                source_type=test_source_type,
                json_data={},
            )

        def forbidden_insert_function(cursor):
            cursor.execute(
                """
                    INSERT into "erc"."report_source_type"(report_version_id)
                    values(%s)
                """,
                (t.report_version_2013_draft.id,),
            )

        def update_function(cursor):
            cursor.execute(
                """
                    UPDATE "erc"."report_source_type"
                    SET json_data = %s
                    WHERE id = %s
                """,
                ('{"test": "test"}', report_source_type_2010_draft.id),
            )
            return cursor.rowcount

        def forbidden_update_function(cursor):
            cursor.execute(
                """
                    UPDATE "erc"."report_source_type"
                    SET json_data = %s
                    WHERE id = %s
                """,
                ('{"test": "test"}', report_source_type_2013_draft.id),
            )
            return cursor.rowcount

        def delete_function(cursor):
            # Delete the report for the approved user operator
            cursor.execute(
                """
                    DELETE from "erc"."report_source_type"
                    WHERE id = %s
                """,
                (report_source_type_2010_draft.id,),
            )
            return cursor.rowcount

        def forbidden_delete_function(cursor):
            # Delete the report for the approved user operator
            cursor.execute(
                """
                    DELETE from "erc"."report_source_type"
                    WHERE id in (%s,%s)
                """,
                (report_source_type_2010_submitted.id, report_source_type_2013_draft.id),
            )
            return cursor.rowcount

        assert_policies_for_industry_user(
            ReportSourceType,
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

    def test_report_source_type_rls_cas_user(self):
        test_quantity = 2
        make_recipe(
            "reporting.tests.utils.report_source_type",
        )
        make_recipe(
            "reporting.tests.utils.report_source_type",
        )

        def select_function(cursor):
            assert ReportSourceType.objects.count() == test_quantity

        assert_policies_for_cas_roles(
            ReportSourceType,
            select_function=select_function,
        )
