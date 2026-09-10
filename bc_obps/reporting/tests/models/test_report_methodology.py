from common.tests.utils.helpers import BaseTestCase
from registration.tests.constants import TIMESTAMP_COMMON_FIELDS
from reporting.tests.utils.constants import REPORT_DATA_MODELS_COMMON_FIELDS
from reporting.tests.utils.immutable_report_version import (
    assert_immutable_report_version,
)
from reporting.tests.utils.report_data_bakers import report_methodology_baker
from reporting.models import ReportMethodology
from reporting.tests.utils.report_rls_test_infrastructure import ReportRlsTestSetup
from rls.tests.helpers import assert_policies_for_cas_roles, assert_policies_for_industry_user
from common.lib import pgtrigger
from model_bakery.baker import make_recipe


class ReportMethodologyModelTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        cls.test_object = report_methodology_baker()
        cls.field_data = [
            *TIMESTAMP_COMMON_FIELDS,
            *REPORT_DATA_MODELS_COMMON_FIELDS,
            ("report_emission", "report emission", None, None),
            ("methodology_id", "methodology", None, None),
        ]

    def test_immutable_after_report_version_submitted(self):
        assert_immutable_report_version("reporting.tests.utils.report_methodology")


class ReportMethodologyRlsTest(BaseTestCase):

    def test_report_methodology_rls_industry_user(self):
        # Common Test Setup
        t = ReportRlsTestSetup(parent_object='report_emission')

        # ReportMethodology Setup
        # Inside access bounds
        with pgtrigger.ignore("reporting.ReportMethodology:immutable_report_version"):
            report_methodology_2010_submitted = make_recipe(
                'reporting.tests.utils.report_methodology',
                report_version=t.report_version_2010_submitted,
            )
        report_methodology_2010_draft = make_recipe(
            'reporting.tests.utils.report_methodology', report_version=t.report_version_2010_draft
        )
        # Outside access bounds
        report_methodology_2013_draft = make_recipe(
            'reporting.tests.utils.report_methodology', report_version=t.report_version_2013_draft
        )

        test_methodology = make_recipe('reporting.tests.utils.methodology')

        def select_function(cursor):
            ReportMethodology.objects.get(id=report_methodology_2010_submitted.id)

        def forbidden_select_function(cursor):
            ReportMethodology.objects.get(id=report_methodology_2013_draft.id)

        def insert_function(cursor):
            ReportMethodology.objects.create(
                report_version=t.report_version_2010_draft,
                report_emission=t.parent_object_2010_draft,
                methodology=test_methodology,
                json_data={},
            )

        def forbidden_insert_function(cursor):
            cursor.execute(
                """
                    INSERT into "erc"."report_methodology"(report_version_id)
                    values(%s)
                """,
                (t.report_version_2013_draft.id,),
            )

        def update_function(cursor):
            cursor.execute(
                """
                    UPDATE "erc"."report_methodology"
                    SET json_data = %s
                    WHERE id = %s
                """,
                ('{"test": "test"}', report_methodology_2010_draft.id),
            )
            return cursor.rowcount

        def forbidden_update_function(cursor):
            cursor.execute(
                """
                    UPDATE "erc"."report_methodology"
                    SET json_data = %s
                    WHERE id = %s
                """,
                ('{"test": "test"}', report_methodology_2013_draft.id),
            )
            return cursor.rowcount

        def delete_function(cursor):
            # Delete the report for the approved user operator
            cursor.execute(
                """
                    DELETE from "erc"."report_methodology"
                    WHERE id = %s
                """,
                (report_methodology_2010_draft.id,),
            )
            return cursor.rowcount

        def forbidden_delete_function(cursor):
            # Delete the report for the approved user operator
            cursor.execute(
                """
                    DELETE from "erc"."report_methodology"
                    WHERE id in (%s,%s)
                """,
                (report_methodology_2010_submitted.id, report_methodology_2013_draft.id),
            )
            return cursor.rowcount

        assert_policies_for_industry_user(
            ReportMethodology,
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

    def test_report_methodology_rls_cas_user(self):
        test_quantity = 2
        make_recipe(
            "reporting.tests.utils.report_methodology",
        )
        make_recipe(
            "reporting.tests.utils.report_methodology",
        )

        def select_function(cursor):
            assert ReportMethodology.objects.count() == test_quantity

        assert_policies_for_cas_roles(
            ReportMethodology,
            select_function=select_function,
        )
