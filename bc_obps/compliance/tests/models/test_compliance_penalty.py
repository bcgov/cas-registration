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
        approved_compliance_penalty = make_recipe(
            'compliance.tests.utils.compliance_penalty', compliance_obligation=approved_compliance_obligation
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

        assert CompliancePenalty.objects.count() == 2

        def select_function(cursor):
            CompliancePenalty.objects.get(id=approved_compliance_penalty.id)

        def forbidden_select_function(cursor):
            CompliancePenalty.objects.get(id=random_compliance_penalty.id)

        assert_policies_for_industry_user(
            CompliancePenalty,
            approved_user_operator.user,
            select_function=select_function,
            forbidden_select_function=forbidden_select_function,
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

        def select_function(cursor):
            assert CompliancePenalty.objects.count() == 1

        assert_policies_for_cas_roles(
            CompliancePenalty,
            select_function=select_function,
        )
