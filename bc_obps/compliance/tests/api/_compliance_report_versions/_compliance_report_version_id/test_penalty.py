from decimal import Decimal
from compliance.models import ComplianceObligation
from unittest.mock import patch

from model_bakery.baker import make_recipe

from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.utils import custom_reverse_lazy
from compliance.dataclass import PaymentDataWithFreshnessFlag
from compliance.models import ElicensingPayment


class TestPenaltyByComplianceReportVersionEndpoint(CommonTestSetup):
    """Tests for GET /compliance-report-versions/{id}/penalty endpoint."""

    @patch(
        "compliance.service.compliance_dashboard_service.ComplianceDashboardService.get_peanlty_payments_by_compliance_report_version_id"  # noqa: E501
    )
    @patch("compliance.service.compliance_obligation_service.ComplianceObligation.objects.get")
    @patch("compliance.service.penalty_calculation_service.PenaltyCalculationService.get_penalty_data")
    def test_successful_penalty_retrieval(
        self, mock_get_penalty_data, mock_get_compliance_obligation_get, mock_get_payment_data
    ):
        """Happy-path: service returns penalty data and payments."""
        # Arrange

        mock_penalty_data = {
            "outstanding_amount": Decimal("38656.43"),
            "penalty_status": "Accruing",
            "data_is_fresh": True,
            "total_amount": Decimal("38656.43"),
        }
        # Mock ComplianceObligation return value (only the fields accessed by the service)
        mock_get_compliance_obligation_get.return_value = ComplianceObligation()

        mock_get_penalty_data.return_value = mock_penalty_data

        mock_payment_data = PaymentDataWithFreshnessFlag(
            data_is_fresh=True,
            data=ElicensingPayment.objects.none(),
        )
        mock_get_payment_data.return_value = mock_payment_data

        operator = make_recipe('registration.tests.utils.operator')
        # Act
        TestUtils.authorize_current_user_as_operator_user(self, operator=operator)
        response = TestUtils.mock_get_with_auth_role(
            self,
            "industry_user",
            custom_reverse_lazy(
                "get_penalty_by_compliance_report_version_id", kwargs={"compliance_report_version_id": 123}
            ),
        )

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["outstanding_amount"] == "38656.43"
        assert data["penalty_status"] == "Accruing"
        assert data["data_is_fresh"]
        assert data["payment_data"]["row_count"] == 0
        assert data["payment_data"]["rows"] == []

    @patch(
        "compliance.models.compliance_obligation.ComplianceObligation.objects.get",
        side_effect=ComplianceObligation.DoesNotExist("not found"),
    )
    @patch(
        "compliance.service.compliance_dashboard_service.ComplianceDashboardService.get_peanlty_payments_by_compliance_report_version_id"  # noqa: E501
    )
    def test_invalid_compliance_report_version_id(self, _mock_get_payment_data, _mock_get_compliance_obligation):
        """Endpoint should return 404 for non-existent report version id."""
        operator = make_recipe("registration.tests.utils.operator")

        TestUtils.authorize_current_user_as_operator_user(self, operator=operator)
        response = TestUtils.mock_get_with_auth_role(
            self,
            "industry_user",
            custom_reverse_lazy(
                "get_penalty_by_compliance_report_version_id", kwargs={"compliance_report_version_id": 123}
            ),
        )

        assert response.status_code == 404
        assert response.json() == {"message": "Not Found"}
