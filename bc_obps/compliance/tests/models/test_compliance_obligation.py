from decimal import Decimal
from rls.tests.helpers import assert_policies_for_cas_roles, assert_policies_for_industry_user, run_with_rollback
from compliance.models.compliance_obligation import ComplianceObligation
from common.tests.utils.helpers import BaseTestCase
from registration.tests.constants import TIMESTAMP_COMMON_FIELDS
from model_bakery.baker import make_recipe
from compliance.tests.utils.compliance_rls_test_infrastructure import ComplianceReportRlsTestSetup
from django.db import connection
from rls.middleware.rls import RlsMiddleware


class ComplianceObligationTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        cls.test_object = make_recipe('compliance.tests.utils.compliance_obligation')
        cls.field_data = [
            *TIMESTAMP_COMMON_FIELDS,
            ("id", "ID", None, None),
            ("compliance_report_version", "compliance report version", None, None),
            ("elicensing_invoice", "elicensing invoice", None, None),
            ("obligation_id", "obligation id", None, None),
            ("fee_amount_dollars", "fee amount dollars", None, None),
            ("fee_date", "fee date", None, None),
            ("penalty_status", "penalty status", None, None),
            ("compliance_penalties", "compliance penalty", None, None),
            ("elicensing_invoice", "elicensing invoice", None, None),
        ]


#  RLS tests
class TestComplianceObligationRls(BaseTestCase):
    def test_compliance_obligation_rls_industry_user(self):
        # test setup
        t = ComplianceReportRlsTestSetup()
        # mock_report_version = make_recipe(
        #     'reporting.tests.utils.report_version', report=t.compliance_report_2010.report
        # )
        # mock_compliance_report_summary = make_recipe(
        #     'reporting.tests.utils.report_compliance_summary', report_version=mock_report_version
        # )

        # within access bounds
        obligation_2010 = make_recipe(
            'compliance.tests.utils.compliance_obligation', compliance_report_version=t.compliance_report_version_2010
        )
        supp_compliance_report_version_2010 = make_recipe(
            'compliance.tests.utils.compliance_report_version',
            compliance_report=t.compliance_report_2010,
            is_supplementary=True,
        )

        # outside access bounds
        obligation_2013 = make_recipe(
            'compliance.tests.utils.compliance_obligation', compliance_report_version=t.compliance_report_version_2013
        )
        supp_compliance_report_version_2013 = make_recipe(
            'compliance.tests.utils.compliance_report_version',
            compliance_report=t.compliance_report_2013,
            is_supplementary=True,
        )

        # current
        def select_function(cursor):
            ComplianceObligation.objects.get(id=obligation_2010.id)

        def forbidden_select_function(cursor):
            ComplianceObligation.objects.get(id=obligation_2013.id)

        def insert_function(cursor):
            ComplianceObligation.objects.create(
                id=888,
                compliance_report_version=supp_compliance_report_version_2010,
                obligation_id=888,
            )

        def forbidden_insert_function(cursor):
            cursor.execute(
                """
                    INSERT INTO "erc"."compliance_obligation" (
                        compliance_report_version_id, obligation_id, penalty_status
                    ) VALUES (
                        %s, %s, %s
                    )
                """,
                (supp_compliance_report_version_2013.id, '1234', 'None'),
            )

        def update_function(cursor):
            cursor.execute(
                """
                    UPDATE "erc"."compliance_obligation"
                    SET fee_amount_dollars = %s
                    WHERE id = %s
                """,
                (Decimal('8888'), obligation_2010.id),
            )
            return cursor.rowcount

        def forbidden_update_function(cursor):
            cursor.execute(
                """
                    UPDATE "erc"."compliance_obligation"
                    SET fee_amount_dollars = %s
                    WHERE id = %s
                """,
                (Decimal('8888'), obligation_2013.id),
            )
            return cursor.rowcount

        # Extra assert for forbidden delete unless crv is superceded
        # Ensure status is not 'Superceded' to prevent delete
        t.compliance_report_version_2010.status = 'Obligation not met'
        t.compliance_report_version_2010.save()

        def forbidden_delete_unless_superceded(cursor):
            cursor.execute(
                """
                   DELETE FROM "erc"."compliance_obligation"
                   WHERE id = %s
                """,
                (obligation_2010.id,),
            )
            return cursor.rowcount

        with connection.cursor() as cursor:
            RlsMiddleware._set_user_guid_and_role(cursor, t.approved_user_operator.user)
            forbidden_deleted_records_count = run_with_rollback(cursor, forbidden_delete_unless_superceded)
            assert (
                forbidden_deleted_records_count == 0
            ), f"Expected 0 deleted records when status is not 'Superceded', but got {forbidden_deleted_records_count} (did you remember to return in the delete function?)"

        # Update status to 'Superceded' to allow for delete
        t.compliance_report_version_2010.status = 'Superceded'
        t.compliance_report_version_2010.save()

        def delete_function(cursor):
            cursor.execute(
                """
                   DELETE FROM "erc"."compliance_obligation"
                   WHERE id = %s
                """,
                (obligation_2010.id,),
            )
            return cursor.rowcount

        def forbidden_delete_function(cursor):
            cursor.execute(
                """
                   DELETE FROM "erc"."compliance_obligation"
                   WHERE id = %s
                """,
                (obligation_2013.id,),
            )
            return cursor.rowcount

        assert_policies_for_industry_user(
            ComplianceObligation,
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

    def test_compliance_obligation_rls_cas_users(self):
        ComplianceReportRlsTestSetup()

        def select_function(cursor):
            assert ComplianceObligation.objects.count() == 2

        assert_policies_for_cas_roles(
            ComplianceObligation,
            select_function=select_function,
        )
