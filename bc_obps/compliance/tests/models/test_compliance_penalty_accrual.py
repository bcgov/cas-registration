from rls.tests.helpers import assert_policies_for_cas_roles, assert_policies_for_industry_user
from compliance.models.compliance_penalty_accrual import CompliancePenaltyAccrual
from common.tests.utils.helpers import BaseTestCase
from registration.tests.constants import TIMESTAMP_COMMON_FIELDS
from model_bakery.baker import make_recipe


class CompliancePenaltyAccrualTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        cls.test_object = make_recipe('compliance.tests.utils.compliance_penalty_accrual')
        cls.field_data = [
            *TIMESTAMP_COMMON_FIELDS,
            ("id", "ID", None, None),
            ("compliance_penalty", "compliance penalty", None, None),
            ("date", "date", None, None),
            ("daily_penalty", "daily penalty", None, None),
            ("daily_compounded", "daily compounded", None, None),
            ("accumulated_penalty", "accumulated penalty", None, None),
            ("accumulated_compounded", "accumulated compounded", None, None),
        ]


#  RLS tests
class TestCompliancePenaltyAccrualRls(BaseTestCase):
    def test_compliance_penalty_accrual_rls_industry_user(self):
        # create two user_operators to set up for transfers
        new_user_operator = make_recipe('registration.tests.utils.approved_user_operator')
        old_user_operator = make_recipe('registration.tests.utils.approved_user_operator')

        # operation
        operation = make_recipe(
            'registration.tests.utils.operation', operator=new_user_operator.operator, status="Registered"
        )
        # timeline of current and historical ownership
        make_recipe(
            'registration.tests.utils.operation_designated_operator_timeline',
            operation=operation,
            operator=old_user_operator.operator,
        )
        make_recipe(
            'registration.tests.utils.operation_designated_operator_timeline',
            operation=operation,
            operator=new_user_operator.operator,
        )
        # old operator's data
        old_operator_report = make_recipe(
            'reporting.tests.utils.report', operation=operation, operator=old_user_operator.operator
        )
        old_operator_compliance_report = make_recipe(
            'compliance.tests.utils.compliance_report', report=old_operator_report
        )

        old_operator_compliance_report_version = make_recipe(
            'compliance.tests.utils.compliance_report_version', compliance_report=old_operator_compliance_report
        )

        old_operator_compliance_obligation = make_recipe(
            'compliance.tests.utils.compliance_obligation',
            compliance_report_version=old_operator_compliance_report_version,
        )
        old_operator_compliance_penalty = make_recipe(
            'compliance.tests.utils.compliance_penalty', compliance_obligation=old_operator_compliance_obligation
        )
        old_operator_compliance_penalty_accrual = make_recipe(
            'compliance.tests.utils.compliance_penalty_accrual', compliance_penalty=old_operator_compliance_penalty
        )

        # new operator's data
        new_operator_report = make_recipe(
            'reporting.tests.utils.report', operation=operation, operator=new_user_operator.operator
        )
        new_operator_compliance_report = make_recipe(
            'compliance.tests.utils.compliance_report', report=new_operator_report
        )

        new_operator_compliance_report_version = make_recipe(
            'compliance.tests.utils.compliance_report_version', compliance_report=new_operator_compliance_report
        )

        new_operator_compliance_obligation = make_recipe(
            'compliance.tests.utils.compliance_obligation',
            compliance_report_version=new_operator_compliance_report_version,
        )

        new_operator_compliance_penalty = make_recipe(
            'compliance.tests.utils.compliance_penalty', compliance_obligation=new_operator_compliance_obligation
        )
        new_operator_compliance_penalty_accrual = make_recipe(
            'compliance.tests.utils.compliance_penalty_accrual', compliance_penalty=new_operator_compliance_penalty
        )

        # current
        def select_function(cursor):
            CompliancePenaltyAccrual.objects.get(id=new_operator_compliance_penalty_accrual.id)

        def forbidden_select_function(cursor):
            CompliancePenaltyAccrual.objects.get(id=old_operator_compliance_penalty_accrual.id)

        assert_policies_for_industry_user(
            CompliancePenaltyAccrual,
            new_user_operator.user,
            select_function=select_function,
            forbidden_select_function=forbidden_select_function,
        )

        # transferred
        def select_function(cursor):
            CompliancePenaltyAccrual.objects.get(id=old_operator_compliance_penalty_accrual.id)

        def forbidden_select_function(cursor):
            CompliancePenaltyAccrual.objects.get(id=new_operator_compliance_penalty_accrual.id)

        assert_policies_for_industry_user(
            CompliancePenaltyAccrual,
            old_user_operator.user,
            select_function=select_function,
            forbidden_select_function=forbidden_select_function,
        )

    def test_compliance_penalty_accrual_rls_cas_users(self):
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
        compliance_penalty = make_recipe(
            'compliance.tests.utils.compliance_penalty', compliance_obligation=compliance_obligation
        )
        make_recipe('compliance.tests.utils.compliance_penalty_accrual', id=88, compliance_penalty=compliance_penalty)

        def select_function(cursor):
            assert CompliancePenaltyAccrual.objects.count() == 1

        assert_policies_for_cas_roles(
            CompliancePenaltyAccrual,
            select_function=select_function,
        )
