from compliance.models.compliance_penalty_rate import CompliancePenaltyRate
from model_bakery.baker import make_recipe

from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.utils import custom_reverse_lazy
from common.tests.utils.helpers import assert_error_response


class TestCompliancePenaltyRateEndpoint(CommonTestSetup):
    """Tests for GET compliance/compliance-penalty-rate endpoint."""

    def test_successful_compliance_penalty_rate_retrieval(
        self,
    ):
        """Happy-path: service returns current compliance penalty rate."""
        # Mock authorization
        operator = make_recipe('registration.tests.utils.operator')
        TestUtils.authorize_current_user_as_operator_user(self, operator=operator)

        # Act
        response = TestUtils.mock_get_with_auth_role(
            self,
            "industry_user",
            custom_reverse_lazy(
                "get_current_compliance_penalty_rate",
            ),
        )

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["rate"] == "0.003800"
        assert data["is_current_rate"]

    def test_no_compliance_penalty_rate(self):
        """Endpoint should return 404 for non-existent compliance_penalty_rate."""
        operator = make_recipe("registration.tests.utils.operator")
        TestUtils.authorize_current_user_as_operator_user(self, operator=operator)

        CompliancePenaltyRate.objects.get(is_current_rate=True).delete()

        response = TestUtils.mock_get_with_auth_role(
            self,
            "industry_user",
            custom_reverse_lazy("get_current_compliance_penalty_rate"),
        )

        assert_error_response(response, 404, "Not Found")
