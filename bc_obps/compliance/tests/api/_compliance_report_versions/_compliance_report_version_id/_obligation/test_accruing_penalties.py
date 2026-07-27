from decimal import Decimal
from unittest.mock import patch
from model_bakery.baker import make_recipe
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.utils import custom_reverse_lazy


class TestAccruingPenaltiesEndpoint(CommonTestSetup):
    @staticmethod
    def _get_endpoint_url(compliance_report_version_id):
        return custom_reverse_lazy(
            "get_accruing_penalties",
            kwargs={"compliance_report_version_id": compliance_report_version_id},
        )

    @patch("compliance.service.penalty_calculation_service.PenaltyCalculationService.get_accruing_penalty_data")
    def test_get_accruing_penalties_success(self, mock_get_accruing_penalty_data):
        # Arrange
        mock_get_accruing_penalty_data.return_value = {
            "faa_interest": Decimal("1000.00"),
            "automatic_overdue_penalty_amount": Decimal("3800.00"),
            "ggeapar_interest_amount": Decimal("500.00"),
        }

        operator = make_recipe("registration.tests.utils.operator")
        TestUtils.authorize_current_user_as_operator_user(self, operator=operator)
        compliance_report_version = make_recipe(
            "compliance.tests.utils.compliance_report_version",
            compliance_report__report__operator=operator,
            compliance_report__report__operation__operator=operator,
        )

        # Act
        response = TestUtils.mock_get_with_auth_role(
            self,
            "industry_user",
            self._get_endpoint_url(compliance_report_version.id),
        )

        # Assert
        assert response.status_code == 200
        response_data = response.json()

        assert response_data["faa_interest"] == "1000.00"
        assert response_data["automatic_overdue_penalty_amount"] == "3800.00"
        assert response_data["ggeapar_interest_amount"] == "500.00"
        # The daily accrual breakdown is internal-only and must not be exposed to external users
        assert "daily_accumulated_list" not in response_data

    @patch("compliance.service.penalty_calculation_service.PenaltyCalculationService.get_accruing_penalty_data")
    def test_get_accruing_penalties_when_nothing_accruing(self, mock_get_accruing_penalty_data):
        # Arrange
        mock_get_accruing_penalty_data.return_value = {
            "faa_interest": Decimal("0.00"),
            "automatic_overdue_penalty_amount": Decimal("0.00"),
            "ggeapar_interest_amount": Decimal("0.00"),
        }

        operator = make_recipe("registration.tests.utils.operator")
        TestUtils.authorize_current_user_as_operator_user(self, operator=operator)
        compliance_report_version = make_recipe(
            "compliance.tests.utils.compliance_report_version",
            compliance_report__report__operator=operator,
            compliance_report__report__operation__operator=operator,
        )

        # Act
        response = TestUtils.mock_get_with_auth_role(
            self,
            "industry_user",
            self._get_endpoint_url(compliance_report_version.id),
        )

        # Assert
        assert response.status_code == 200
        response_data = response.json()

        assert response_data["faa_interest"] == "0.00"
        assert response_data["automatic_overdue_penalty_amount"] == "0.00"
        assert response_data["ggeapar_interest_amount"] == "0.00"
