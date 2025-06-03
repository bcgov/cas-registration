from unittest.mock import patch
from model_bakery.baker import make_recipe
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.utils import custom_reverse_lazy
from compliance.models import ComplianceEarnedCredit


class TestComplianceReportVersionEarnedCreditsEndpoint(CommonTestSetup):
    @patch(
        "compliance.service.earned_credits_service.ComplianceEarnedCreditsService.get_earned_credits_data_by_report_version"
    )
    def test_get_earned_credits_success(self, mock_get_earned_credits):
        # Arrange
        earned_credits = make_recipe(
            'compliance.tests.utils.compliance_earned_credit',
            earned_credits_amount=100,
            issuance_status=ComplianceEarnedCredit.IssuanceStatus.CREDITS_NOT_ISSUED,
            bccr_trading_name="Test Trading Name",
            analyst_comment="Test analyst comment",
            director_comment="Test director comment",
        )
        mock_get_earned_credits.return_value = earned_credits

        # Mock authorization
        operator = make_recipe('registration.tests.utils.operator')
        TestUtils.authorize_current_user_as_operator_user(self, operator=operator)
        response = TestUtils.mock_get_with_auth_role(
            self,
            "industry_user",
            custom_reverse_lazy(
                "get_compliance_report_version_earned_credits", kwargs={"compliance_report_version_id": 123}
            ),
        )

        # Assert
        assert response.status_code == 200
        response_data = response.json()

        # Verify the response structure and data matches ComplianceEarnedCreditsOut schema
        assert "id" in response_data
        assert response_data["earned_credits_amount"] == 100
        assert response_data["issuance_status"] == ComplianceEarnedCredit.IssuanceStatus.CREDITS_NOT_ISSUED
        assert response_data["bccr_trading_name"] == "Test Trading Name"
        assert response_data["analyst_comment"] == "Test analyst comment"
        assert response_data["director_comment"] == "Test director comment"
