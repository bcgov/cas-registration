from decimal import Decimal
from unittest.mock import patch
import pytest
from model_bakery.baker import make_recipe
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.utils import custom_reverse_lazy


class TestAutomaticOverduePenaltyEndpoint(CommonTestSetup):
    def setup_method(self):
        super().setup_method()
        operator = make_recipe('registration.tests.utils.operator')
        TestUtils.authorize_current_user_as_operator_user(self, operator=operator)
        compliance_report_version = make_recipe(
            "compliance.tests.utils.compliance_report_version",
            compliance_report__report__operation__operator=operator,
            compliance_report__report__operator=operator,
        )
        TestUtils.generate_operation_operator_timeline(
            operator=operator, operations=[compliance_report_version.compliance_report.report.operation]
        )
        self.compliance_report_version_id = compliance_report_version.id
        self.endpoint_url = custom_reverse_lazy(
            "get_automatic_overdue_penalty", kwargs={"compliance_report_version_id": compliance_report_version.id}
        )

    @patch(
        "compliance.service.penalty_calculation_service.PenaltyCalculationService.get_automatic_overdue_penalty_data"
    )
    @pytest.mark.parametrize("due_date, invoice_number", [("2025-11-30", "AUTO-PENALTY-001"), (None, None)])
    def test_get_automatic_overdue_penalty_success(self, mock_get_penalty_data, due_date, invoice_number):
        mock_get_penalty_data.return_value = {
            "penalty_status": "NOT PAID",
            "penalty_type": "Automatic Overdue",
            "penalty_charge_rate": Decimal("0.38"),
            "total_penalty": Decimal("38656.43"),
            "total_amount": Decimal("38656.43"),
            "due_date": due_date,
            "invoice_number": invoice_number,
        }

        response = TestUtils.mock_get_with_auth_role(self, "industry_user", self.endpoint_url)

        assert response.status_code == 200, response.content
        assert response.json() == {
            "penalty_status": "Not Paid",
            "penalty_type": "Automatic Overdue",
            "penalty_charge_rate": "0.38",
            "total_penalty": "38656.43",
            "total_amount": "38656.43",
            "due_date": due_date,
            "invoice_number": invoice_number,
        }
        mock_get_penalty_data.assert_called_once_with(self.compliance_report_version_id)
