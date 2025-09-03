from rls.tests.helpers import assert_policies_for_industry_user
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
        operator = make_recipe('registration.tests.utils.operator', id=1)
        approved_user_operator = make_recipe('registration.tests.utils.approved_user_operator', operator=operator)
        approved_client_operator = make_recipe(
            'compliance.tests.utils.elicensing_client_operator',
            operator=approved_user_operator.operator,
            client_object_id="1147483647",
        )
        approved_invoice = make_recipe(
            'compliance.tests.utils.elicensing_invoice', elicensing_client_operator=approved_client_operator
        )
        approved_compliance_penalty = make_recipe(
            'compliance.tests.utils.compliance_penalty', elicensing_invoice=approved_invoice
        )
        make_recipe('compliance.tests.utils.compliance_penalty_accrual', compliance_penalty=approved_compliance_penalty)

        # second object
        random_operator = make_recipe('registration.tests.utils.operator', id=2)
        random_client_operator = make_recipe(
            'compliance.tests.utils.elicensing_client_operator', operator=random_operator, client_object_id="1147483647"
        )
        random_invoice = make_recipe(
            'compliance.tests.utils.elicensing_invoice', elicensing_client_operator=random_client_operator
        )
        random_compliance_penalty = make_recipe(
            'compliance.tests.utils.compliance_penalty', elicensing_invoice=random_invoice
        )
        make_recipe('compliance.tests.utils.compliance_penalty_accrual', compliance_penalty=random_compliance_penalty)

        assert CompliancePenaltyAccrual.objects.count() == 2

        def select_function(cursor):
            assert CompliancePenaltyAccrual.objects.count() == 1

        assert_policies_for_industry_user(
            CompliancePenaltyAccrual,
            approved_user_operator.user,
            select_function=select_function,
        )
