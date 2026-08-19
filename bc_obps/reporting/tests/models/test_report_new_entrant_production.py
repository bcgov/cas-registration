from common.tests.utils.helpers import BaseTestCase
from reporting.tests.utils.immutable_report_version import (
    assert_immutable_report_version,
)
from reporting.tests.utils.report_data_bakers import report_new_entrant_production_baker
from registration.tests.constants import TIMESTAMP_COMMON_FIELDS
from reporting.models import ReportNewEntrantProduction
from reporting.tests.utils.report_rls_test_infrastructure import ReportRlsTestSetup
from rls.tests.helpers import assert_policies_for_cas_roles, assert_policies_for_industry_user
from common.lib import pgtrigger
from model_bakery.baker import make_recipe
from decimal import Decimal


class ReportNewEntrantProductionModelTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        cls.test_object = report_new_entrant_production_baker()
        cls.field_data = [
            *TIMESTAMP_COMMON_FIELDS,
            ("id", "ID", None, None),
            ("product", "product", None, None),
            ("report_new_entrant", "report new entrant", None, None),
            ("production_amount", "production amount", None, None),
            ("report_version", "report version", None, None),
        ]

    def test_immutable_after_report_version_submitted(self):
        assert_immutable_report_version(
            "reporting.tests.utils.report_new_entrant_production",
            path_to_report_version="report_new_entrant__report_version",
        )


class ReportNewEntrantProductRlsTest(BaseTestCase):

    def test_report_new_entrant_production_rls_industry_user(self):
        # Common Test Setup
        t = ReportRlsTestSetup(parent_object='report_new_entrant')

        # ReportNewEntrantProduction Setup
        # Inside access bounds
        with pgtrigger.ignore("reporting.ReportNewEntrantProduction:immutable_report_version"):
            report_new_entrant_production_2010_submitted = make_recipe(
                'reporting.tests.utils.report_new_entrant_production',
                report_version=t.report_version_2010_submitted,
            )
        report_new_entrant_production_2010_draft = make_recipe(
            'reporting.tests.utils.report_new_entrant_production', report_version=t.report_version_2010_draft
        )
        # Outside access bounds
        report_new_entrant_production_2013_draft = make_recipe(
            'reporting.tests.utils.report_new_entrant_production', report_version=t.report_version_2013_draft
        )

        test_product = make_recipe('registration.tests.utils.regulated_product')

        def select_function(cursor):
            ReportNewEntrantProduction.objects.get(id=report_new_entrant_production_2010_submitted.id)

        def forbidden_select_function(cursor):
            ReportNewEntrantProduction.objects.get(id=report_new_entrant_production_2013_draft.id)

        def insert_function(cursor):
            ReportNewEntrantProduction.objects.create(
                report_version=t.report_version_2010_draft,
                report_new_entrant=t.parent_object_2010_draft,
                product=test_product,
            )

        def forbidden_insert_function(cursor):
            cursor.execute(
                """
                    INSERT into "erc"."report_new_entrant_production"(report_version_id)
                    values(%s)
                """,
                (t.report_version_2013_draft.id,),
            )

        def update_function(cursor):
            cursor.execute(
                """
                    UPDATE "erc"."report_new_entrant_production"
                    SET production_amount = %s
                    WHERE id = %s
                """,
                (Decimal('20'), report_new_entrant_production_2010_draft.id),
            )
            return cursor.rowcount

        def forbidden_update_function(cursor):
            cursor.execute(
                """
                    UPDATE "erc"."report_new_entrant_production"
                    SET production_amount = %s
                    WHERE id = %s
                """,
                (Decimal('20'), report_new_entrant_production_2013_draft.id),
            )
            return cursor.rowcount

        def delete_function(cursor):
            # Delete the report for the approved user operator
            cursor.execute(
                """
                    DELETE from "erc"."report_new_entrant_production"
                    WHERE id = %s
                """,
                (report_new_entrant_production_2010_draft.id,),
            )
            return cursor.rowcount

        def forbidden_delete_function(cursor):
            # Delete the report for the approved user operator
            cursor.execute(
                """
                    DELETE from "erc"."report_new_entrant_production"
                    WHERE id in (%s,%s)
                """,
                (report_new_entrant_production_2010_submitted.id, report_new_entrant_production_2013_draft.id),
            )
            return cursor.rowcount

        assert_policies_for_industry_user(
            ReportNewEntrantProduction,
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

    def test_report_new_entrant_production_rls_cas_user(self):
        test_quantity = 2
        make_recipe(
            "reporting.tests.utils.report_new_entrant_production",
        )
        make_recipe(
            "reporting.tests.utils.report_new_entrant_production",
        )

        def select_function(cursor):
            assert ReportNewEntrantProduction.objects.count() == test_quantity

        assert_policies_for_cas_roles(
            ReportNewEntrantProduction,
            select_function=select_function,
        )
