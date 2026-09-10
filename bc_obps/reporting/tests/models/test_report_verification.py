from common.tests.utils.helpers import BaseTestCase
from registration.tests.constants import TIMESTAMP_COMMON_FIELDS
from model_bakery.baker import make_recipe
from reporting.tests.utils.immutable_report_version import (
    assert_immutable_report_version,
)
from reporting.models import ReportVerification
from reporting.tests.utils.report_rls_test_infrastructure import ReportRlsTestSetup
from rls.tests.helpers import assert_policies_for_cas_roles, assert_policies_for_industry_user
from common.lib import pgtrigger


class ReportVerificationTest(BaseTestCase):
    """
    Test case for the ReportVerification model to verify its fields and functionality.
    """

    @classmethod
    def setUpTestData(cls):
        # Create a test instance of ReportVerification using the baker
        cls.test_object = make_recipe("reporting.tests.utils.report_verification")
        # Define the field data to validate in tests
        cls.field_data = [
            ("id", "ID", None, None),
            *TIMESTAMP_COMMON_FIELDS,
            ("report_version", "report version", None, None),
            ("verification_body_name", "verification body name", None, None),
            ("accredited_by", "accredited by", None, None),
            ("scope_of_verification", "scope of verification", None, None),
            ("threats_to_independence", "threats to independence", None, None),
            ("verification_conclusion", "verification conclusion", None, None),
        ]

    def test_immutable_after_report_version_submitted(self):
        assert_immutable_report_version("reporting.tests.utils.report_verification")


class ReportVerificationRlsTest(BaseTestCase):

    def test_report_verification_rls_industry_user(self):
        # Common Test Setup
        t = ReportRlsTestSetup()

        # ReportVerification Setup
        # Inside access bounds
        with pgtrigger.ignore("reporting.ReportVerification:immutable_report_version"):
            report_verification_2010_submitted = make_recipe(
                'reporting.tests.utils.report_verification',
                report_version=t.report_version_2010_submitted,
            )
        report_verification_2010_draft = make_recipe(
            'reporting.tests.utils.report_verification', report_version=t.report_version_2010_draft
        )
        # Outside access bounds
        report_verification_2013_draft = make_recipe(
            'reporting.tests.utils.report_verification', report_version=t.report_version_2013_draft
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
            ReportVerification.objects.get(id=report_verification_2010_submitted.id)

        def forbidden_select_function(cursor):
            ReportVerification.objects.get(id=report_verification_2013_draft.id)

        def insert_function(cursor):
            ReportVerification.objects.create(report_version=report_version_2012_draft)

        def forbidden_insert_function(cursor):
            cursor.execute(
                """
                    INSERT into "erc"."report_verification"(report_version_id)
                    values(%s)
                """,
                (t.report_version_2013_draft.id,),
            )

        def update_function(cursor):
            cursor.execute(
                """
                    UPDATE "erc"."report_verification"
                    SET verification_body_name = %s
                    WHERE id = %s
                """,
                ('test', report_verification_2010_draft.id),
            )
            return cursor.rowcount

        def forbidden_update_function(cursor):
            cursor.execute(
                """
                    UPDATE "erc"."report_verification"
                    SET verification_body_name = %s
                    WHERE id = %s
                """,
                ('test', report_verification_2013_draft.id),
            )
            return cursor.rowcount

        def delete_function(cursor):
            # Delete the report for the approved user operator
            cursor.execute(
                """
                    DELETE from "erc"."report_verification"
                    WHERE id = %s
                """,
                (report_verification_2010_draft.id,),
            )
            return cursor.rowcount

        def forbidden_delete_function(cursor):
            # Delete the report for the approved user operator
            cursor.execute(
                """
                    DELETE from "erc"."report_verification"
                    WHERE id in (%s,%s)
                """,
                (report_verification_2010_submitted.id, report_verification_2013_draft.id),
            )
            return cursor.rowcount

        assert_policies_for_industry_user(
            ReportVerification,
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

    def test_report_verification_rls_cas_user(self):
        test_quantity = 2
        make_recipe(
            "reporting.tests.utils.report_verification",
        )
        make_recipe(
            "reporting.tests.utils.report_verification",
        )

        def select_function(cursor):
            assert ReportVerification.objects.count() == test_quantity

        assert_policies_for_cas_roles(
            ReportVerification,
            select_function=select_function,
        )
