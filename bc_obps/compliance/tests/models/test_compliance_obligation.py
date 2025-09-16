from decimal import Decimal
from rls.tests.helpers import assert_policies_for_cas_roles, assert_policies_for_industry_user
from compliance.models.compliance_obligation import ComplianceObligation
from common.tests.utils.helpers import BaseTestCase
from registration.tests.constants import TIMESTAMP_COMMON_FIELDS
from model_bakery.baker import make_recipe


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
            ("obligation_deadline", "obligation deadline", None, None),
            ("fee_amount_dollars", "fee amount dollars", None, None),
            ("fee_date", "fee date", None, None),
            ("penalty_status", "penalty status", None, None),
            ("compliance_penalty", "compliance penalty", None, None),
        ]


#  RLS tests
class TestComplianceObligationRls(BaseTestCase):
    def test_compliance_obligation_rls_industry_user(self):
        # approved object
        approved_user_operator = make_recipe('registration.tests.utils.approved_user_operator')
        approved_operation = make_recipe(
            'registration.tests.utils.operation', operator=approved_user_operator.operator, status="Registered"
        )
        approved_report = make_recipe(
            'reporting.tests.utils.report', operation=approved_operation, operator=approved_user_operator.operator
        )
        approved_compliance_report = make_recipe('compliance.tests.utils.compliance_report', report=approved_report)
        approved_compliance_report_version = make_recipe(
            'compliance.tests.utils.compliance_report_version',
            compliance_report=approved_compliance_report,
            is_supplementary=False,
        )
        approved_compliance_obligation = make_recipe(
            'compliance.tests.utils.compliance_obligation',
            id=111,
            compliance_report_version=approved_compliance_report_version,
        )

        # second object
        random_operator = make_recipe('registration.tests.utils.operator')
        random_operation = make_recipe('registration.tests.utils.operation', operator=random_operator)
        random_report = make_recipe('reporting.tests.utils.report', operation=random_operation)
        random_compliance_report = make_recipe('compliance.tests.utils.compliance_report', report=random_report)
        random_compliance_report_version = make_recipe(
            'compliance.tests.utils.compliance_report_version', compliance_report=random_compliance_report
        )
        random_compliance_obligation = make_recipe(
            'compliance.tests.utils.compliance_obligation',
            id=444,
            compliance_report_version=random_compliance_report_version,
        )

        # extra object for insert
        approved_operation2 = make_recipe(
            'registration.tests.utils.operation', operator=approved_user_operator.operator, status="Registered"
        )
        # extra object for insert
        approved_compliance_report_version_for_insert = make_recipe(
            'compliance.tests.utils.compliance_report_version',
            compliance_report__report__operation=approved_operation2,
            is_supplementary=False,
        )

        assert ComplianceObligation.objects.count() == 2

        def select_function(cursor):
            ComplianceObligation.objects.get(id=approved_compliance_obligation.id)

        def forbidden_select_function(cursor):
            ComplianceObligation.objects.get(id=random_compliance_obligation.id)

        def insert_function(cursor):
            ComplianceObligation.objects.create(
                id=888,
                compliance_report_version=approved_compliance_report_version_for_insert,
                obligation_id=888,
                obligation_deadline="2025-11-30",
            )

            assert ComplianceObligation.objects.filter(
                compliance_report_version=approved_compliance_report_version_for_insert
            ).exists()

        def forbidden_insert_function(cursor):
            cursor.execute(
                """
                    INSERT INTO "erc"."compliance_obligation" (
                        compliance_report_version_id
                    ) VALUES (
                        %s
                    )
                """,
                (random_compliance_report_version.id,),
            )

        def update_function(cursor):
            return ComplianceObligation.objects.filter(id=approved_compliance_obligation.id).update(
                fee_amount_dollars=Decimal('8888')
            )

        def forbidden_update_function(cursor):
            return ComplianceObligation.objects.filter(id=random_compliance_obligation.id).update(
                fee_amount_dollars=Decimal('8888')
            )

        assert_policies_for_industry_user(
            ComplianceObligation,
            approved_user_operator.user,
            select_function=select_function,
            insert_function=insert_function,
            update_function=update_function,
            forbidden_select_function=forbidden_select_function,
            forbidden_insert_function=forbidden_insert_function,
            forbidden_update_function=forbidden_update_function,
        )

    def test_compliance_obligation_rls_cas_users(self):
        operator = make_recipe('registration.tests.utils.operator')
        operation = make_recipe('registration.tests.utils.operation', operator=operator)
        report = make_recipe('reporting.tests.utils.report', operation=operation)
        compliance_report = make_recipe('compliance.tests.utils.compliance_report', report=report)
        compliance_report_version = make_recipe(
            'compliance.tests.utils.compliance_report_version', compliance_report=compliance_report
        )
        make_recipe(
            'compliance.tests.utils.compliance_obligation', id=888, compliance_report_version=compliance_report_version
        )

        def select_function(cursor):
            assert ComplianceObligation.objects.count() == 1

        assert_policies_for_cas_roles(
            ComplianceObligation,
            select_function=select_function,
        )
