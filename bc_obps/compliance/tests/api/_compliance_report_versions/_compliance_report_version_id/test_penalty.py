from decimal import Decimal
from compliance.models import ComplianceObligation
from unittest.mock import patch

from model_bakery.baker import make_recipe

from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.utils import custom_reverse_lazy
from compliance.models import ElicensingPayment


class TestPenaltyByComplianceReportVersionEndpoint(CommonTestSetup):
    """Tests for GET /compliance-report-versions/{id}/penalty endpoint."""

    @patch(
        "compliance.service.penalty_summary_service.PenaltySummaryService.get_summary_by_compliance_report_version_id"
    )
    def test_successful_penalty_retrieval(
        self,
        mock_get_summary,
    ):
        """Happy-path: service returns penalty data and payments."""
        # Arrange
        mock_get_summary.return_value = {
            "outstanding_amount": Decimal("38656.43"),
            "penalty_status": "Accruing",
            "data_is_fresh": True,
            "payments_is_fresh": True,
            "payments": ElicensingPayment.objects.none(),
        }

        operator = make_recipe('registration.tests.utils.operator')
        # Act
        TestUtils.authorize_current_user_as_operator_user(self, operator=operator)
        compliance_report_version = make_recipe(
            "compliance.tests.utils.compliance_report_version",
            compliance_report__report__operator=operator,
        )
        response = TestUtils.mock_get_with_auth_role(
            self,
            "industry_user",
            custom_reverse_lazy(
                "get_penalty_by_compliance_report_version_id",
                kwargs={"compliance_report_version_id": compliance_report_version.id},
            ),
        )

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["outstanding_amount"] == "38656.43"
        assert data["penalty_status"] == "Accruing"
        assert data["data_is_fresh"]
        assert data["payment_data"]["data_is_fresh"]
        assert data["payment_data"]["row_count"] == 0
        assert data["payment_data"]["rows"] == []

    @patch(
        "compliance.service.penalty_summary_service.PenaltySummaryService.get_summary_by_compliance_report_version_id",
        side_effect=ComplianceObligation.DoesNotExist("not found"),
    )
    @patch("common.permissions.validate_all", return_value=True)
    def test_invalid_compliance_report_version_id(self, _mock_get_summary, _):
        """Endpoint should return 404 for non-existent report version id."""
        # operator = make_recipe("registration.tests.utils.operator")

        # TestUtils.authorize_current_user_as_operator_user(self, operator=operator)
        response = TestUtils.mock_get_with_auth_role(
            self,
            "industry_user",
            custom_reverse_lazy(
                "get_penalty_by_compliance_report_version_id", kwargs={"compliance_report_version_id": 123}
            ),
        )

        assert response.status_code == 404
        assert response.json() == {"message": "Not Found"}
