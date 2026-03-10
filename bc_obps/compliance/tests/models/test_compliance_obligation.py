from decimal import Decimal
from rls.tests.helpers import assert_policies_for_cas_roles, assert_policies_for_industry_user
from compliance.models.compliance_report_version import ComplianceReportVersion
from compliance.models.compliance_obligation import ComplianceObligation
from common.tests.utils.helpers import BaseTestCase
from registration.tests.constants import TIMESTAMP_COMMON_FIELDS
from model_bakery.baker import make_recipe
from compliance.tests.utils.compliance_test_helper import ComplianceTestHelper


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
        # create two user_operators to set up for transfers
        new_user_operator = make_recipe('registration.tests.utils.approved_user_operator')
        old_user_operator = make_recipe('registration.tests.utils.approved_user_operator')

        # create the test data
        old_test_data = ComplianceTestHelper.build_test_data(
            crv_status=ComplianceReportVersion.ComplianceStatus.OBLIGATION_NOT_MET
        )
        new_test_data = ComplianceTestHelper.build_test_data(
            crv_status=ComplianceReportVersion.ComplianceStatus.OBLIGATION_NOT_MET
        )
        new_test_data.report.operator = new_user_operator.operator
        new_test_data.operation.operator = new_user_operator.operator
        new_test_data.report.save()
        old_test_data.report.operator = old_user_operator.operator
        old_test_data.operation.operator = old_user_operator.operator
        old_test_data.report.save()
        # timeline of current and historical ownership
        make_recipe(
            'registration.tests.utils.operation_designated_operator_timeline',
            operation=old_test_data.operation,
            operator=old_user_operator.operator,
        )
        make_recipe(
            'registration.tests.utils.operation_designated_operator_timeline',
            operation=new_test_data.operation,
            operator=new_user_operator.operator,
        )
        # extra object for insert
        new_operator_compliance_report_version_for_insert = make_recipe(
            'compliance.tests.utils.compliance_report_version',
            compliance_report=new_test_data.compliance_report,
            is_supplementary=False,
        )
        old_operator_compliance_report_version_for_insert = make_recipe(
            'compliance.tests.utils.compliance_report_version',
            compliance_report=old_test_data.compliance_report,
            is_supplementary=False,
        )

        # current
        def select_function(cursor):
            ComplianceObligation.objects.get(id=new_test_data.compliance_obligation.id)

        def forbidden_select_function(cursor):
            ComplianceObligation.objects.get(id=old_test_data.compliance_obligation.id)

        def insert_function(cursor):
            ComplianceObligation.objects.create(
                id=888,
                compliance_report_version=new_operator_compliance_report_version_for_insert,
                obligation_id=888,
            )

        def forbidden_insert_function(cursor):
            cursor.execute(
                """
                    INSERT INTO "erc"."compliance_obligation" (
                        compliance_report_version_id
                    ) VALUES (
                        %s
                    )
                """,
                (old_test_data.compliance_report_version.id,),
            )

        def update_function(cursor):
            cursor.execute(
                """
                    UPDATE "erc"."compliance_obligation"
                    SET fee_amount_dollars = %s
                    WHERE id = %s
                """,
                (Decimal('8888'), new_test_data.compliance_obligation.id),
            )
            return cursor.rowcount

        def forbidden_update_function(cursor):
            cursor.execute(
                """
                    UPDATE "erc"."compliance_obligation"
                    SET fee_amount_dollars = %s
                    WHERE id = %s
                """,
                (Decimal('8888'), old_test_data.compliance_obligation.id),
            )
            return cursor.rowcount

        def delete_function(cursor):
            cursor.execute(
                """
                   DELETE FROM "erc"."compliance_obligation"
                   WHERE id = %s
                """,
                (new_test_data.compliance_obligation.id,),
            )
            return cursor.rowcount

        def forbidden_delete_function(cursor):
            cursor.execute(
                """
                   DELETE FROM "erc"."compliance_obligation"
                   WHERE id = %s
                """,
                (old_test_data.compliance_obligation.id,),
            )
            return cursor.rowcount

        assert_policies_for_industry_user(
            ComplianceObligation,
            new_user_operator.user,
            select_function=select_function,
            insert_function=insert_function,
            update_function=update_function,
            delete_function=delete_function,
            forbidden_select_function=forbidden_select_function,
            forbidden_insert_function=forbidden_insert_function,
            forbidden_update_function=forbidden_update_function,
            forbidden_delete_function=forbidden_delete_function,
        )

        # previous
        def select_function(cursor):
            ComplianceObligation.objects.get(id=old_test_data.compliance_obligation.id)

        def forbidden_select_function(cursor):
            ComplianceObligation.objects.get(id=new_test_data.compliance_obligation.id)

        def insert_function(cursor):
            ComplianceObligation.objects.create(
                id=889,
                compliance_report_version=old_operator_compliance_report_version_for_insert,
                obligation_id=888,
            )

        def forbidden_insert_function(cursor):
            cursor.execute(
                """
                    INSERT INTO "erc"."compliance_obligation" (
                        compliance_report_version_id
                    ) VALUES (
                        %s
                    )
                """,
                (new_test_data.compliance_report_version.id,),
            )

        def update_function(cursor):
            cursor.execute(
                """
                    UPDATE "erc"."compliance_obligation"
                    SET fee_amount_dollars = %s
                    WHERE id = %s
                """,
                (Decimal('8888'), old_test_data.compliance_obligation.id),
            )
            return cursor.rowcount

        def forbidden_update_function(cursor):
            cursor.execute(
                """
                    UPDATE "erc"."compliance_obligation"
                    SET fee_amount_dollars = %s
                    WHERE id = %s
                """,
                (Decimal('8888'), new_test_data.compliance_obligation.id),
            )
            return cursor.rowcount

        def delete_function(cursor):
            cursor.execute(
                """
                   DELETE FROM "erc"."compliance_obligation"
                   WHERE id = %s
                """,
                (old_test_data.compliance_obligation.id,),
            )
            return cursor.rowcount

        def forbidden_delete_function(cursor):
            cursor.execute(
                """
                   DELETE FROM "erc"."compliance_obligation"
                   WHERE id = %s
                """,
                (old_test_data.compliance_obligation.id,),
            )
            return cursor.rowcount

        assert_policies_for_industry_user(
            ComplianceObligation,
            old_user_operator.user,
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
        ComplianceTestHelper.build_test_data(crv_status=ComplianceReportVersion.ComplianceStatus.OBLIGATION_NOT_MET)

        def select_function(cursor):
            assert ComplianceObligation.objects.count() == 1

        assert_policies_for_cas_roles(
            ComplianceObligation,
            select_function=select_function,
        )
