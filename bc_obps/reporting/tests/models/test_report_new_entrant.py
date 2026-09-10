from common.tests.utils.helpers import BaseTestCase
from reporting.tests.utils.immutable_report_version import (
    assert_immutable_report_version,
)
from reporting.tests.utils.report_data_bakers import report_new_entrant_baker
from registration.tests.constants import TIMESTAMP_COMMON_FIELDS
from reporting.models import ReportNewEntrant
from reporting.tests.utils.report_rls_test_infrastructure import ReportRlsTestSetup
from rls.tests.helpers import assert_policies_for_cas_roles, assert_policies_for_industry_user
from common.lib import pgtrigger
from model_bakery.baker import make_recipe
from django.utils import timezone


class ReportNewEntrantModelTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        cls.test_object = report_new_entrant_baker()
        cls.field_data = [
            *TIMESTAMP_COMMON_FIELDS,
            ("id", "ID", None, None),
            ("report_version", "report version", None, None),
            ("authorization_date", "authorization date", None, None),
            ("first_shipment_date", "first shipment date", None, None),
            ("new_entrant_period_start", "new entrant period start", None, None),
            ("assertion_statement", "assertion statement", None, None),
            ("productions", "report new entrant production", None, 0),
            ("report_new_entrant_emission", "report new entrant emission", None, None),
        ]

    def test_immutable_after_report_version_submitted(self):
        assert_immutable_report_version("reporting.tests.utils.report_new_entrant")


class ReportNewEntrantRlsTest(BaseTestCase):

    def test_report_new_entrant_rls_industry_user(self):
        # Common Test Setup
        t = ReportRlsTestSetup()

        # ReportNewEntrant Setup
        # Inside access bounds
        with pgtrigger.ignore("reporting.ReportNewEntrant:immutable_report_version"):
            report_new_entrant_2010_submitted = make_recipe(
                'reporting.tests.utils.report_new_entrant',
                report_version=t.report_version_2010_submitted,
            )
        report_new_entrant_2010_draft = make_recipe(
            'reporting.tests.utils.report_new_entrant', report_version=t.report_version_2010_draft
        )
        # Outside access bounds
        report_new_entrant_2013_draft = make_recipe(
            'reporting.tests.utils.report_new_entrant', report_version=t.report_version_2013_draft
        )

        def select_function(cursor):
            ReportNewEntrant.objects.get(id=report_new_entrant_2010_submitted.id)

        def forbidden_select_function(cursor):
            ReportNewEntrant.objects.get(id=report_new_entrant_2013_draft.id)

        def insert_function(cursor):
            ReportNewEntrant.objects.create(
                report_version=t.report_version_2010_draft,
                authorization_date=timezone.now(),
                first_shipment_date=timezone.now(),
                new_entrant_period_start=timezone.now(),
                assertion_statement=True,
            )

        def forbidden_insert_function(cursor):
            cursor.execute(
                """
                    INSERT into "erc"."report_new_entrant"(report_version_id, authorization_date, first_shipment_date, new_entrant_period_start, assertion_statement)
                    values(%s, now(), now(), now(), 't')
                """,
                (t.report_version_2013_draft.id,),
            )

        def update_function(cursor):
            cursor.execute(
                """
                    UPDATE "erc"."report_new_entrant"
                    SET assertion_statement = %s
                    WHERE id = %s
                """,
                ('false', report_new_entrant_2010_draft.id),
            )
            return cursor.rowcount

        def forbidden_update_function(cursor):
            cursor.execute(
                """
                    UPDATE "erc"."report_new_entrant"
                    SET assertion_statement = %s
                    WHERE id = %s
                """,
                ('false', report_new_entrant_2013_draft.id),
            )
            return cursor.rowcount

        def delete_function(cursor):
            # Delete the report for the approved user operator
            cursor.execute(
                """
                    DELETE from "erc"."report_new_entrant"
                    WHERE id = %s
                """,
                (report_new_entrant_2010_draft.id,),
            )
            return cursor.rowcount

        def forbidden_delete_function(cursor):
            # Delete the report for the approved user operator
            cursor.execute(
                """
                    DELETE from "erc"."report_new_entrant"
                    WHERE id in (%s,%s)
                """,
                (report_new_entrant_2010_submitted.id, report_new_entrant_2013_draft.id),
            )
            return cursor.rowcount

        assert_policies_for_industry_user(
            ReportNewEntrant,
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

    def test_report_new_entrant_rls_cas_user(self):
        test_quantity = 5
        make_recipe(
            "reporting.tests.utils.report_new_entrant",
            _quantity=test_quantity,
        )

        def select_function(cursor):
            assert ReportNewEntrant.objects.count() == test_quantity

        assert_policies_for_cas_roles(
            ReportNewEntrant,
            select_function=select_function,
        )
