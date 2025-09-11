from decimal import Decimal
from rls.tests.helpers import assert_policies_for_cas_roles, assert_policies_for_industry_user
from compliance.models.compliance_penalty import CompliancePenalty
from common.tests.utils.helpers import BaseTestCase
from registration.tests.constants import TIMESTAMP_COMMON_FIELDS
from model_bakery.baker import make_recipe


class CompliancePenaltyTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        cls.test_object = make_recipe('compliance.tests.utils.compliance_penalty')
        cls.field_data = [
            *TIMESTAMP_COMMON_FIELDS,
            ("id", "ID", None, None),
            ("compliance_obligation", "compliance obligation", None, None),
            ("elicensing_invoice", "elicensing invoice", None, None),
            ("accrual_start_date", "accrual start date", None, None),
            ("penalty_amount", "penalty amount", None, None),
            ("compliance_penalty_accruals", "compliance penalty accrual", None, None),
            ("fee_date", "fee date", None, None),
            ("penalty_type", "penalty type", 100, None),
        ]


#  RLS tests
class TestCompliancePenaltyRls(BaseTestCase):
    def test_compliance_penalty_rls_industry_user(self):
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
            'compliance.tests.utils.compliance_obligation', compliance_report_version=approved_compliance_report_version
        )
        make_recipe('compliance.tests.utils.compliance_penalty', compliance_obligation=approved_compliance_obligation)

        # second object
        random_operator = make_recipe('registration.tests.utils.operator')
        random_operation = make_recipe('registration.tests.utils.operation', operator=random_operator)
        random_report = make_recipe('reporting.tests.utils.report', operation=random_operation)
        random_compliance_report = make_recipe('compliance.tests.utils.compliance_report', report=random_report)
        random_compliance_report_version = make_recipe(
            'compliance.tests.utils.compliance_report_version', compliance_report=random_compliance_report
        )
        random_compliance_obligation = make_recipe(
            'compliance.tests.utils.compliance_obligation', compliance_report_version=random_compliance_report_version
        )
        make_recipe('compliance.tests.utils.compliance_penalty', compliance_obligation=random_compliance_obligation)

        # extra object for insert
        extra_approved_operation = make_recipe(
            'registration.tests.utils.operation', operator=approved_user_operator.operator, status="Registered"
        )
        extra_approved_report = make_recipe(
            'reporting.tests.utils.report', operation=extra_approved_operation, operator=approved_user_operator.operator
        )
        extra_approved_compliance_report = make_recipe(
            'compliance.tests.utils.compliance_report', report=extra_approved_report
        )
        extra_approved_compliance_report_version = make_recipe(
            'compliance.tests.utils.compliance_report_version',
            compliance_report=extra_approved_compliance_report,
            is_supplementary=False,
        )
        extra_approved_compliance_obligation = make_recipe(
            'compliance.tests.utils.compliance_obligation',
            compliance_report_version=extra_approved_compliance_report_version,
        )
        extra_invoice = make_recipe(
            'compliance.tests.utils.elicensing_invoice',
            elicensing_client_operator__operator=approved_user_operator.operator,
        )

        assert CompliancePenalty.objects.count() == 2

        def select_function(cursor):
            assert CompliancePenalty.objects.count() == 1

        def forbidden_insert_function(cursor):
            CompliancePenalty.objects.create(
                id=888,
                compliance_obligation=extra_approved_compliance_obligation,
                accrual_start_date="2025-01-01",
                penalty_amount=100.00,
                fee_date="2025-01-31",
                elicensing_invoice=extra_invoice,
                penalty_type="Late Submission",
            )

        def forbidden_update_function(cursor):
            CompliancePenalty.objects.filter(id=888).update(penalty_amount=200.00)

        def forbidden_delete_function(cursor):
            CompliancePenalty.objects.all().delete()

        assert_policies_for_industry_user(
            CompliancePenalty,
            approved_user_operator.user,
            select_function=select_function,
            forbidden_insert_function=forbidden_insert_function,
            forbidden_update_function=forbidden_update_function,
            forbidden_delete_function=forbidden_delete_function,
            test_forbidden_ops=True,
        )

    def test_compliance_penalty_rls_cas_users(self):
        operator = make_recipe('registration.tests.utils.operator')
        operation = make_recipe('registration.tests.utils.operation', operator=operator)
        report = make_recipe('reporting.tests.utils.report', operation=operation)
        compliance_report = make_recipe('compliance.tests.utils.compliance_report', report=report)
        compliance_report_version = make_recipe(
            'compliance.tests.utils.compliance_report_version', compliance_report=compliance_report
        )
        compliance_obligation = make_recipe(
            'compliance.tests.utils.compliance_obligation', compliance_report_version=compliance_report_version
        )
        make_recipe('compliance.tests.utils.compliance_penalty', id=888, compliance_obligation=compliance_obligation)

        operator_2 = make_recipe('registration.tests.utils.operator')
        operation_2 = make_recipe('registration.tests.utils.operation', operator=operator_2)
        report_2 = make_recipe('reporting.tests.utils.report', operation=operation_2)
        compliance_report_2 = make_recipe('compliance.tests.utils.compliance_report', report=report_2)
        compliance_report_version_2 = make_recipe(
            'compliance.tests.utils.compliance_report_version', compliance_report=compliance_report_2
        )
        compliance_obligation_2 = make_recipe(
            'compliance.tests.utils.compliance_obligation', compliance_report_version=compliance_report_version_2
        )

        def select_function(cursor):
            assert CompliancePenalty.objects.count() == 1

        def forbidden_insert_function(cursor):
            CompliancePenalty.objects.create(
                id=876,
                compliance_obligation=compliance_obligation_2,
                accrual_start_date="2025-01-01",
                penalty_amount=100.00,
                fee_date="2025-01-31",
                penalty_type="Automatic Overdue",
            )

        def forbidden_update_function(cursor):
            CompliancePenalty.objects.filter(id=888).update(penalty_amount=Decimal('555'))

        def forbidden_delete_function(cursor):
            CompliancePenalty.objects.filter(id=888).delete()

        assert_policies_for_cas_roles(
            CompliancePenalty,
            select_function=select_function,
            forbidden_insert_function=forbidden_insert_function,
            forbidden_update_function=forbidden_update_function,
            forbidden_delete_function=forbidden_delete_function,
            test_forbidden_ops=True,
        )
