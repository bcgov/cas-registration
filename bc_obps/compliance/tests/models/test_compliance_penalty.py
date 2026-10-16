from rls.tests.helpers import assert_policies_for_cas_roles, assert_policies_for_industry_user
from compliance.models import CompliancePenalty
from common.tests.utils.helpers import BaseTestCase
from registration.tests.constants import TIMESTAMP_COMMON_FIELDS
from model_bakery.baker import make_recipe
from compliance.tests.utils.compliance_rls_test_infrastructure import ComplianceReportRlsTestSetup


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
        t = ComplianceReportRlsTestSetup()
        # within access bounds
        obligation_2010 = make_recipe(
            'compliance.tests.utils.compliance_obligation', compliance_report_version=t.compliance_report_version_2010
        )
        penalty_2010 = make_recipe('compliance.tests.utils.compliance_penalty', compliance_obligation=obligation_2010)
        # outside access bounds
        obligation_2013 = make_recipe(
            'compliance.tests.utils.compliance_obligation', compliance_report_version=t.compliance_report_version_2013
        )
        penalty_2013 = make_recipe('compliance.tests.utils.compliance_penalty', compliance_obligation=obligation_2013)

        def select_function(cursor):
            CompliancePenalty.objects.get(id=penalty_2010.id)

        def forbidden_select_function(cursor):
            CompliancePenalty.objects.get(id=penalty_2013.id)

        assert_policies_for_industry_user(
            CompliancePenalty,
            t.approved_user_operator.user,
            select_function=select_function,
            forbidden_select_function=forbidden_select_function,
        )

    def test_compliance_penalty_rls_cas_users(self):
        t = ComplianceReportRlsTestSetup()
        # within access bounds
        obligation_2010 = make_recipe(
            'compliance.tests.utils.compliance_obligation', compliance_report_version=t.compliance_report_version_2010
        )
        make_recipe('compliance.tests.utils.compliance_penalty', compliance_obligation=obligation_2010)
        # outside access bounds
        obligation_2013 = make_recipe(
            'compliance.tests.utils.compliance_obligation', compliance_report_version=t.compliance_report_version_2013
        )
        make_recipe('compliance.tests.utils.compliance_penalty', compliance_obligation=obligation_2013)

        def select_function(cursor):
            assert CompliancePenalty.objects.count() == 2

        assert_policies_for_cas_roles(
            CompliancePenalty,
            select_function=select_function,
        )
