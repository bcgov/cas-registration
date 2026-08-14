from common.tests.utils.helpers import BaseTestCase
from registration.tests.constants import TIMESTAMP_COMMON_FIELDS
from model_bakery.baker import make_recipe
from reporting.tests.utils.immutable_report_version import (
    assert_immutable_report_version,
)
from reporting.models import ReportSignOff
from reporting.tests.utils.report_rls_test_infrastructure import ReportRlsTestSetup
from rls.tests.helpers import assert_policies_for_cas_roles, assert_policies_for_industry_user
from common.lib import pgtrigger
from django.utils import timezone


class ReportSignOffTest(BaseTestCase):
    """
    Test case for the ReportSignOff model to verify its fields and functionality.
    """

    @classmethod
    def setUpTestData(cls):
        # Create a test instance of ReportSignOff using the baker
        cls.test_object = make_recipe("reporting.tests.utils.report_sign_off")
        # Define the field data to validate in tests
        cls.field_data = [
            ("id", "ID", None, None),
            *TIMESTAMP_COMMON_FIELDS,
            ("report_version", "report version", None, None),
            ("acknowledgement_of_review", "acknowledgement of review", None, None),
            ("acknowledgement_of_records", "acknowledgement of records", None, None),
            ("acknowledgement_of_information", "acknowledgement of information", None, None),
            ("acknowledgement_of_errors", "acknowledgement of errors", None, None),
            ("acknowledgement_of_possible_costs", "acknowledgement of possible costs", None, None),
            ("acknowledgement_of_new_version", "acknowledgement of new version", None, None),
            ("acknowledgement_of_corrections", "acknowledgement of corrections", None, None),
            ("acknowledgement_of_certification", "acknowledgement of certification", None, None),
            ("signature", "signature", None, None),
            ("signing_date", "signing date", None, None),
        ]

    def test_immutable_after_report_version_submitted(self):
        assert_immutable_report_version("reporting.tests.utils.report_sign_off")


class ReportSignOffRlsTest(BaseTestCase):

    def test_report_sign_off_rls_industry_user(self):
        # Common Test Setup
        t = ReportRlsTestSetup()

        # ReportSignOff Setup
        # Inside access bounds
        with pgtrigger.ignore("reporting.ReportSignOff:immutable_report_version"):
            report_sign_off_2010_submitted = make_recipe(
                'reporting.tests.utils.report_sign_off',
                report_version=t.report_version_2010_submitted,
            )
        report_sign_off_2010_draft = make_recipe(
            'reporting.tests.utils.report_sign_off', report_version=t.report_version_2010_draft
        )
        # Outside access bounds
        report_sign_off_2013_draft = make_recipe(
            'reporting.tests.utils.report_sign_off', report_version=t.report_version_2013_draft
        )

        # Additionl report_version needed for insert test: 2012 - Within access bounds
        reporting_year_2012 = make_recipe('reporting.tests.utils.reporting_year', reporting_year=2012)
        report_2012 = make_recipe(
            'reporting.tests.utils.report',
            operation=t.report_version_2010_submitted.report.operation,
            operator=t.report_version_2010_submitted.report.operator,
            reporting_year=reporting_year_2012,
        )
        report_version_2012_draft = make_recipe(
            'reporting.tests.utils.report_version', report=report_2012, status='Draft'
        )

        def select_function(cursor):
            ReportSignOff.objects.get(id=report_sign_off_2010_submitted.id)

        def forbidden_select_function(cursor):
            ReportSignOff.objects.get(id=report_sign_off_2013_draft.id)

        def insert_function(cursor):
            ReportSignOff.objects.create(
                report_version=report_version_2012_draft, signature='asdf', signing_date=timezone.now()
            )

        def forbidden_insert_function(cursor):
            cursor.execute(
                """
                    INSERT into "erc"."report_sign_off"(report_version_id, signature, signing_date)
                    values(%s,%s,%s)
                """,
                (t.report_version_2013_draft.id, 'asdf', timezone.now()),
            )

        def update_function(cursor):
            cursor.execute(
                """
                    UPDATE "erc"."report_sign_off"
                    SET acknowledgement_of_review = %s
                    WHERE id = %s
                """,
                ('true', report_sign_off_2010_draft.id),
            )
            return cursor.rowcount

        def forbidden_update_function(cursor):
            cursor.execute(
                """
                    UPDATE "erc"."report_sign_off"
                    SET acknowledgement_of_review = %s
                    WHERE id = %s
                """,
                ('true', report_sign_off_2013_draft.id),
            )
            return cursor.rowcount

        def delete_function(cursor):
            # Delete the report for the approved user operator
            cursor.execute(
                """
                    DELETE from "erc"."report_sign_off"
                    WHERE id = %s
                """,
                (report_sign_off_2010_draft.id,),
            )
            return cursor.rowcount

        def forbidden_delete_function(cursor):
            # Delete the report for the approved user operator
            cursor.execute(
                """
                    DELETE from "erc"."report_sign_off"
                    WHERE id in (%s,%s)
                """,
                (report_sign_off_2010_submitted.id, report_sign_off_2013_draft.id),
            )
            return cursor.rowcount

        assert_policies_for_industry_user(
            ReportSignOff,
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

    def test_report_sign_off_rls_cas_user(self):
        test_quantity = 2
        make_recipe(
            "reporting.tests.utils.report_sign_off",
        )
        make_recipe(
            "reporting.tests.utils.report_sign_off",
        )

        def select_function(cursor):
            assert ReportSignOff.objects.count() == test_quantity

        assert_policies_for_cas_roles(
            ReportSignOff,
            select_function=select_function,
        )
