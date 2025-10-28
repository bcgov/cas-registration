from decimal import Decimal
from unittest.mock import patch
from compliance.models.compliance_obligation import ComplianceObligation
from compliance.models.compliance_penalty import CompliancePenalty
from model_bakery.baker import make_recipe
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.utils import custom_reverse_lazy


class TestLateSubmissionPenaltyEndpoint(CommonTestSetup):
    @patch("compliance.service.compliance_obligation_service.ComplianceObligation.objects.get")
    @patch("compliance.service.penalty_calculation_service.PenaltyCalculationService.get_late_submission_penalty_data")
    def test_get_late_submission_penalty_success(self, mock_get_late_submission_penalty_data, mock_get_obligation):
        # Arrange
        obligation = make_recipe(
            "compliance.tests.utils.compliance_obligation",
        )
        mock_get_obligation.return_value = obligation

        penalty_data = {
            "has_penalty": True,
            "penalty_status": ComplianceObligation.PenaltyStatus.ACCRUING,
            "penalty_type": CompliancePenalty.PenaltyType.LATE_SUBMISSION,
            "penalty_charge_rate": Decimal("9.95"),
            "penalty_amount": Decimal("15000.00"),
            "faa_interest": Decimal("0.00"),
            "total_amount": Decimal("15000.00"),
            "data_is_fresh": True,
        }
        mock_get_late_submission_penalty_data.return_value = penalty_data

        # Mock authorization
        operator = make_recipe('registration.tests.utils.operator')
        TestUtils.authorize_current_user_as_operator_user(self, operator=operator)
        compliance_report_version = make_recipe(
            "compliance.tests.utils.compliance_report_version",
            compliance_report__report__operation__operator=operator,
            compliance_report__report__operator=operator,
        )

        response = TestUtils.mock_get_with_auth_role(
            self,
            "industry_user",
            custom_reverse_lazy(
                "get_late_submission_penalty", kwargs={"compliance_report_version_id": compliance_report_version.id}
            ),
        )

        # Assert
        assert response.status_code == 200
        response_data = response.json()

        # Verify the response structure and data matches LateSubmissionPenaltyOut schema
        assert response_data["has_penalty"] is True
        assert response_data["penalty_status"] == "Accruing"  # resolver makes this title case
        assert response_data["penalty_type"] == "Late Submission"
        assert response_data["penalty_charge_rate"] == "9.95"
        assert response_data["penalty_amount"] == "15000.00"
        assert response_data["faa_interest"] == "0.00"
        assert response_data["total_amount"] == "15000.00"
        assert response_data["data_is_fresh"]
