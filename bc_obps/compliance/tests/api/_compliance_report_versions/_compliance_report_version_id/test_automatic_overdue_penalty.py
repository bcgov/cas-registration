from decimal import Decimal
from unittest.mock import patch
from model_bakery.baker import make_recipe
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.utils import custom_reverse_lazy
from compliance.service.penalty_calculation_service import PenaltyCalculationService


class TestAutomaticOverduePenaltyEndpoint(CommonTestSetup):
    @patch("compliance.service.compliance_obligation_service.ComplianceObligation.objects.get")
    @patch("compliance.service.penalty_calculation_service.PenaltyCalculationService.get_penalty_data")
    def test_get_automatic_overdue_penalty_success(self, mock_get_penalty_data, mock_get_obligation):
        # Arrange
        obligation = make_recipe(
            "compliance.tests.utils.compliance_obligation",
        )
        mock_get_obligation.return_value = obligation

        penalty_data = {
            "penalty_status": "Accruing",
            "penalty_type": PenaltyCalculationService.PenaltyType.AUTOMATIC_OVERDUE.value,
            "days_late": 3,
            "penalty_charge_rate": Decimal("0.38"),
            "accumulated_penalty": Decimal('38000.00'),
            "accumulated_compounding": Decimal('656.43'),
            "total_penalty": Decimal("38656.43"),
            "faa_interest": Decimal("0.00"),
            "total_amount": Decimal("38656.43"),
        }
        mock_get_penalty_data.return_value = penalty_data

        # Mock authorization
        operator = make_recipe('registration.tests.utils.operator')
        TestUtils.authorize_current_user_as_operator_user(self, operator=operator)
        response = TestUtils.mock_get_with_auth_role(
            self,
            "industry_user",
            custom_reverse_lazy("get_automatic_overdue_penalty", kwargs={"compliance_report_version_id": 123}),
        )

        # Assert
        assert response.status_code == 200
        response_data = response.json()

        # Verify the response structure and data matches AutomaticOverduePenaltyOut schema
        assert response_data["penalty_status"] == "Accruing"
        assert response_data["penalty_type"] == "Automatic Overdue"
        assert response_data["days_late"] == 3
        assert response_data["penalty_charge_rate"] == "0.38"
        assert response_data["accumulated_penalty"] == "38000.00"
        assert response_data["accumulated_compounding"] == "656.43"
        assert response_data["total_penalty"] == "38656.43"
        assert response_data["faa_interest"] == "0.00"
        assert response_data["total_amount"] == "38656.43"
