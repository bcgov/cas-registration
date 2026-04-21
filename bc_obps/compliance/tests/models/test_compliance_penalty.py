from rls.tests.helpers import assert_policies_for_cas_roles, assert_policies_for_industry_user
from compliance.models import CompliancePenalty, ComplianceReportVersion
from common.tests.utils.helpers import BaseTestCase
from registration.tests.constants import TIMESTAMP_COMMON_FIELDS
from model_bakery.baker import make_recipe
from compliance.tests.utils.compliance_test_helper import ComplianceTestHelper


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
            ("accrual_final_date", "accrual final date", None, None),
            ("accrual_frequency", "accrual frequency", None, None),
            ("compounding_frequency", "compounding frequency", None, None),
            ("penalty_amount", "penalty amount", None, None),
            ("compliance_penalty_accruals", "compliance penalty accrual", None, None),
            ("fee_date", "fee date", None, None),
            ("penalty_type", "penalty type", 100, None),
            ("status", "status", None, None),
            ("invoice_number", "invoice number", None, None),
        ]


#  RLS tests
class TestCompliancePenaltyRls(BaseTestCase):
    def test_compliance_penalty_rls_industry_user(self):
        test_data_new_operator = ComplianceTestHelper.build_test_data(
            crv_status=ComplianceReportVersion.ComplianceStatus.OBLIGATION_NOT_MET
        )

        # create two user_operators to set up for transfers
        new_user_operator = make_recipe(
            'registration.tests.utils.approved_user_operator', operator=test_data_new_operator.operation.operator
        )
        old_user_operator = make_recipe('registration.tests.utils.approved_user_operator')

        # timeline of current and historical ownership
        make_recipe(
            'registration.tests.utils.operation_designated_operator_timeline',
            operation=test_data_new_operator.operation,
            operator=old_user_operator.operator,
        )
        make_recipe(
            'registration.tests.utils.operation_designated_operator_timeline',
            operation=test_data_new_operator.operation,
            operator=new_user_operator.operator,
        )
        # old operator's data
        old_operator_report = make_recipe(
            'reporting.tests.utils.report',
            operation=test_data_new_operator.operation,
            operator=old_user_operator.operator,
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

        new_operator_compliance_penalty = make_recipe(
            'compliance.tests.utils.compliance_penalty',
            compliance_obligation=test_data_new_operator.compliance_obligation,
        )

        def select_function(cursor):
            CompliancePenalty.objects.get(id=new_operator_compliance_penalty.id)

        def forbidden_select_function(cursor):
            CompliancePenalty.objects.get(id=old_operator_compliance_penalty.id)

        assert_policies_for_industry_user(
            CompliancePenalty,
            new_user_operator.user,
            select_function=select_function,
            forbidden_select_function=forbidden_select_function,
        )

        def select_function(cursor):
            CompliancePenalty.objects.get(id=old_operator_compliance_penalty.id)

        def forbidden_select_function(cursor):
            CompliancePenalty.objects.get(id=new_operator_compliance_penalty.id)

        assert_policies_for_industry_user(
            CompliancePenalty,
            old_user_operator.user,
            select_function=select_function,
            forbidden_select_function=forbidden_select_function,
        )

    def test_compliance_penalty_rls_cas_users(self):
        test_data = ComplianceTestHelper.build_test_data(
            crv_status=ComplianceReportVersion.ComplianceStatus.OBLIGATION_NOT_MET
        )
        make_recipe(
            'compliance.tests.utils.compliance_penalty', id=888, compliance_obligation=test_data.compliance_obligation
        )

        def select_function(cursor):
            assert CompliancePenalty.objects.count() == 1

        assert_policies_for_cas_roles(
            CompliancePenalty,
            select_function=select_function,
        )
