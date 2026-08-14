from common.tests.utils.helpers import BaseTestCase
from registration.tests.constants import TIMESTAMP_COMMON_FIELDS
from reporting.tests.utils.constants import REPORT_DATA_MODELS_COMMON_FIELDS
from reporting.tests.utils.immutable_report_version import (
    assert_immutable_report_version,
)
from reporting.tests.utils.report_data_bakers import report_unit_baker
from reporting.models import ReportUnit
from reporting.tests.utils.report_rls_test_infrastructure import ReportRlsTestSetup
from rls.tests.helpers import assert_policies_for_cas_roles, assert_policies_for_industry_user
from common.lib import pgtrigger
from model_bakery.baker import make_recipe


class ReportUnitModelTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        cls.test_object = report_unit_baker()
        cls.field_data = [
            *TIMESTAMP_COMMON_FIELDS,
            *REPORT_DATA_MODELS_COMMON_FIELDS,
            ("report_source_type", "report source type", None, None),
            ("reportfuel_records", "report fuel", None, 0),
            ("reportemission_records", "report emission", None, 0),
            ("type", "type", None, None),
        ]

    def test_immutable_after_report_version_submitted(self):
        assert_immutable_report_version("reporting.tests.utils.report_unit")


class ReportUnitRlsTest(BaseTestCase):

    def test_report_unit_rls_industry_user(self):
        # Common Test Setup
        t = ReportRlsTestSetup(parent_object='report_source_type')

        # ReportUnit Setup
        # Inside access bounds
        with pgtrigger.ignore("reporting.ReportUnit:immutable_report_version"):
            report_unit_2010_submitted = make_recipe(
                'reporting.tests.utils.report_unit',
                report_version=t.report_version_2010_submitted,
            )
        report_unit_2010_draft = make_recipe(
            'reporting.tests.utils.report_unit', report_version=t.report_version_2010_draft
        )
        # Outside access bounds
        report_unit_2013_draft = make_recipe(
            'reporting.tests.utils.report_unit', report_version=t.report_version_2013_draft
        )

        def select_function(cursor):
            ReportUnit.objects.get(id=report_unit_2010_submitted.id)

        def forbidden_select_function(cursor):
            ReportUnit.objects.get(id=report_unit_2013_draft.id)

        def insert_function(cursor):
            ReportUnit.objects.create(
                report_version=t.report_version_2010_draft,
                report_source_type=t.parent_object_2010_draft,
                json_data={},
            )

        def forbidden_insert_function(cursor):
            cursor.execute(
                """
                    INSERT into "erc"."report_unit"(report_version_id)
                    values(%s)
                """,
                (t.report_version_2013_draft.id,),
            )

        def update_function(cursor):
            cursor.execute(
                """
                    UPDATE "erc"."report_unit"
                    SET json_data = %s
                    WHERE id = %s
                """,
                ('{"test": "test"}', report_unit_2010_draft.id),
            )
            return cursor.rowcount

        def forbidden_update_function(cursor):
            cursor.execute(
                """
                    UPDATE "erc"."report_unit"
                    SET json_data = %s
                    WHERE id = %s
                """,
                ('{"test": "test"}', report_unit_2013_draft.id),
            )
            return cursor.rowcount

        def delete_function(cursor):
            # Delete the report for the approved user operator
            cursor.execute(
                """
                    DELETE from "erc"."report_unit"
                    WHERE id = %s
                """,
                (report_unit_2010_draft.id,),
            )
            return cursor.rowcount

        def forbidden_delete_function(cursor):
            # Delete the report for the approved user operator
            cursor.execute(
                """
                    DELETE from "erc"."report_unit"
                    WHERE id in (%s,%s)
                """,
                (report_unit_2010_submitted.id, report_unit_2013_draft.id),
            )
            return cursor.rowcount

        assert_policies_for_industry_user(
            ReportUnit,
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

    def test_report_unit_rls_cas_user(self):
        test_quantity = 5
        make_recipe(
            "reporting.tests.utils.report_unit",
            _quantity=test_quantity,
        )

        def select_function(cursor):
            assert ReportUnit.objects.count() == test_quantity

        assert_policies_for_cas_roles(
            ReportUnit,
            select_function=select_function,
        )
