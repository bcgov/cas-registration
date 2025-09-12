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
        approved_compliance_penalty = make_recipe(
            'compliance.tests.utils.compliance_penalty', compliance_obligation=approved_compliance_obligation
        )
        approved_compliance_penalty_accrual = make_recipe(
            'compliance.tests.utils.compliance_penalty_accrual', compliance_penalty=approved_compliance_penalty
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
            'compliance.tests.utils.compliance_obligation', compliance_report_version=random_compliance_report_version
        )
        random_compliance_penalty = make_recipe(
            'compliance.tests.utils.compliance_penalty', compliance_obligation=random_compliance_obligation
        )
        random_compliance_penalty_accrual = make_recipe(
            'compliance.tests.utils.compliance_penalty_accrual', compliance_penalty=random_compliance_penalty
        )

        assert CompliancePenaltyAccrual.objects.count() == 2

        def select_function(cursor):
            CompliancePenaltyAccrual.objects.get(id=approved_compliance_penalty_accrual.id)

        def forbidden_select_function(cursor):
            CompliancePenaltyAccrual.objects.get(id=random_compliance_penalty_accrual.id)

        assert_policies_for_industry_user(
            CompliancePenaltyAccrual,
            approved_user_operator.user,
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
