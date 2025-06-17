from model_bakery.baker import make_recipe
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.utils import custom_reverse_lazy
from compliance.models import ComplianceEarnedCredit


class TestEarnedCreditsComplianceReportVersionIDEndpoint(CommonTestSetup):
    def test_get_compliance_report_version_ids_with_actioned_ecs(self):
        # Mock compliance report version for correct earned credits and one false positive
        make_recipe(
            'compliance.tests.utils.compliance_report_version',
            id=700,
        )
        make_recipe(
            'compliance.tests.utils.compliance_earned_credit',
            earned_credits_amount=100,
            issuance_status=ComplianceEarnedCredit.IssuanceStatus.ISSUANCE_REQUESTED,
            bccr_trading_name="Test Name",
            analyst_comment="Test analyst comment",
            director_comment="Test director comment",
            compliance_report_version_id=700,
        )
        make_recipe(
            'compliance.tests.utils.compliance_earned_credit',
            earned_credits_amount=100,
            issuance_status=ComplianceEarnedCredit.IssuanceStatus.CREDITS_NOT_ISSUED,
            bccr_trading_name="Test Not Issued Name",
            analyst_comment="Test not issued comment",
            director_comment="Test not issued director comment",
        )

        # Mock authorization
        operator = make_recipe('registration.tests.utils.operator')
        TestUtils.authorize_current_user_as_operator_user(self, operator=operator)
        response = TestUtils.mock_get_with_auth_role(
            self,
            "cas_admin",
            custom_reverse_lazy("get_compliance_report_version_ids_with_actioned_ecs"),
        )

        # Assert
        assert response.status_code == 200
        response_data = response.json()

        # Verify response is just a list of IDs not tied to CREDITS_NOT_ISSUED
        assert isinstance(response_data, list)  # Returns a list of integers
        assert len(response_data) == 1
        assert "id" not in response_data  # Ensure no 'id' in response
        assert response_data == [700]  # Make sure the returned ID matches the requested issuance earned credit
