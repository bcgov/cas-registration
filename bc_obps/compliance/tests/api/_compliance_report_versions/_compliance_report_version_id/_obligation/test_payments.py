from unittest.mock import patch
from model_bakery.baker import make_recipe
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.utils import custom_reverse_lazy


class TestComplianceObligationPaymentsEndpoint(CommonTestSetup):
    @patch(
        "compliance.service.compliance_dashboard_service.ComplianceDashboardService.get_compliance_obligation_payments_by_compliance_report_version_id"
    )
    def test_get_payments_success(self, mock_get_payments):
        # Arrange: Create a mock payment record
        payment = make_recipe('compliance.tests.utils.elicensing_payment', amount=200, received_date="2024-05-01")

        mock_get_payments.return_value = type("MockResponse", (), {"data": [payment], "data_is_fresh": True})

        # Mock authorization
        operator = make_recipe('registration.tests.utils.operator')
        TestUtils.authorize_current_user_as_operator_user(self, operator=operator)
        compliance_report_version = make_recipe(
            "compliance.tests.utils.compliance_report_version",
            compliance_report__report__operator=operator,
            compliance_report__report__operation__operator=operator,
        )

        # Act: Perform GET request with auth role
        response = TestUtils.mock_get_with_auth_role(
            self,
            "industry_user",
            custom_reverse_lazy(
                "get_compliance_obligation_payments_by_compliance_report_version_id",
                kwargs={"compliance_report_version_id": compliance_report_version.id},
            ),
        )

        # Assert
        assert response.status_code == 200
        response_data = response.json()

        assert response_data["data_is_fresh"] is True
        assert response_data["row_count"] == 1
        assert isinstance(response_data["rows"], list)
        assert response_data["rows"][0]["amount"] == "200"  # Decimal gets serialized as string
        assert response_data["rows"][0]["received_date"] == "2024-05-01"
