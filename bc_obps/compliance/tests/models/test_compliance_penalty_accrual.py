from rls.tests.helpers import assert_policies_for_cas_roles, assert_policies_for_industry_user
from compliance.models.compliance_penalty_accrual import CompliancePenaltyAccrual
from common.tests.utils.helpers import BaseTestCase
from registration.tests.constants import TIMESTAMP_COMMON_FIELDS
from model_bakery.baker import make_recipe
from compliance.tests.utils.compliance_rls_test_infrastructure import ComplianceReportRlsTestSetup


class CompliancePenaltyAccrualTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        cls.test_object = make_recipe('compliance.tests.utils.compliance_penalty_accrual')
        cls.field_data = [
            *TIMESTAMP_COMMON_FIELDS,
            ("id", "ID", None, None),
            ("compliance_penalty", "compliance penalty", None, None),
            ("date", "date", None, None),
            ("interest_rate", "interest rate", None, None),
            ("daily_penalty", "daily penalty", None, None),
            ("daily_compounded", "daily compounded", None, None),
            ("accumulated_penalty", "accumulated penalty", None, None),
            ("accumulated_compounded", "accumulated compounded", None, None),
        ]


#  RLS tests
class TestCompliancePenaltyAccrualRls(BaseTestCase):
    def test_compliance_penalty_accrual_rls_industry_user(self):
        t = ComplianceReportRlsTestSetup()
        # within access bounds
        obligation_2010 = make_recipe(
            'compliance.tests.utils.compliance_obligation', compliance_report_version=t.compliance_report_version_2010
        )
        penalty_2010 = make_recipe('compliance.tests.utils.compliance_penalty', compliance_obligation=obligation_2010)
        accrual_2010 = make_recipe('compliance.tests.utils.compliance_penalty_accrual', compliance_penalty=penalty_2010)
        # outside access bounds
        obligation_2013 = make_recipe(
            'compliance.tests.utils.compliance_obligation', compliance_report_version=t.compliance_report_version_2013
        )
        penalty_2013 = make_recipe('compliance.tests.utils.compliance_penalty', compliance_obligation=obligation_2013)
        accrual_2013 = make_recipe('compliance.tests.utils.compliance_penalty_accrual', compliance_penalty=penalty_2013)

        # current
        def select_function(cursor):
            CompliancePenaltyAccrual.objects.get(id=accrual_2010.id)

        def forbidden_select_function(cursor):
            CompliancePenaltyAccrual.objects.get(id=accrual_2013.id)

        assert_policies_for_industry_user(
            CompliancePenaltyAccrual,
            t.approved_user_operator.user,
            select_function=select_function,
            forbidden_select_function=forbidden_select_function,
        )

    def test_compliance_penalty_accrual_rls_cas_users(self):
        t = ComplianceReportRlsTestSetup()
        obligation_2010 = make_recipe(
            'compliance.tests.utils.compliance_obligation', compliance_report_version=t.compliance_report_version_2010
        )
        penalty_2010 = make_recipe('compliance.tests.utils.compliance_penalty', compliance_obligation=obligation_2010)
        make_recipe('compliance.tests.utils.compliance_penalty_accrual', compliance_penalty=penalty_2010)
        obligation_2013 = make_recipe(
            'compliance.tests.utils.compliance_obligation', compliance_report_version=t.compliance_report_version_2013
        )
        penalty_2013 = make_recipe('compliance.tests.utils.compliance_penalty', compliance_obligation=obligation_2013)
        make_recipe('compliance.tests.utils.compliance_penalty_accrual', compliance_penalty=penalty_2013)

        def select_function(cursor):
            assert CompliancePenaltyAccrual.objects.count() == 2

        assert_policies_for_cas_roles(
            CompliancePenaltyAccrual,
            select_function=select_function,
        )
