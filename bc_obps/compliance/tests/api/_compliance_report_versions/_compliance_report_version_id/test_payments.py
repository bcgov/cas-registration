from decimal import Decimal
from unittest.mock import patch
from model_bakery.baker import make_recipe
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.utils import custom_reverse_lazy
from compliance.service.compliance_dashboard_service import Payment, PaymentsList


class TestComplianceReportVersionPaymentsEndpoint(CommonTestSetup):
    @patch("compliance.service.compliance_dashboard_service.ComplianceDashboardService.get_compliance_report_version_payments")
    def test_get_payments_success(self, mock_get_payments):
        # Arrange
        payments = [
            Payment(id="1", paymentReceivedDate="2024-03-20", paymentAmountApplied=Decimal("100.00"), paymentMethod="Credit Card", transactionType="Payment", receiptNumber="REC-001"),
            Payment(id="2", paymentReceivedDate="2024-03-21", paymentAmountApplied=Decimal("50.00"), paymentMethod="Bank Transfer", transactionType="Payment", receiptNumber="REC-002"),
        ]
        mock_get_payments.return_value = PaymentsList(rows=payments, row_count=2)

        # Mock authorization
        operator = make_recipe('registration.tests.utils.operator')
        TestUtils.authorize_current_user_as_operator_user(self, operator=operator)
        response = TestUtils.mock_get_with_auth_role(self, "industry_user", custom_reverse_lazy("get_compliance_report_version_payments", kwargs={"compliance_report_version_id": 123}))

        # Assert
        assert response.status_code == 200
        response_data = response.json()

        # Verify the response structure
        assert "rows" in response_data
        assert "row_count" in response_data
        assert response_data["row_count"] == 2

        # Verify payment details
        rows = response_data["rows"]
        assert len(rows) == 2

        # Verify first payment
        assert rows[0]["id"] == "1"
        assert rows[0]["paymentReceivedDate"] == "2024-03-20"
        assert Decimal(rows[0]["paymentAmountApplied"]) == Decimal("100.00")
        assert rows[0]["paymentMethod"] == "Credit Card"
        assert rows[0]["transactionType"] == "Payment"
        assert rows[0]["receiptNumber"] == "REC-001"

        # Verify second payment
        assert rows[1]["id"] == "2"
        assert rows[1]["paymentReceivedDate"] == "2024-03-21"
        assert Decimal(rows[1]["paymentAmountApplied"]) == Decimal("50.00")
        assert rows[1]["paymentMethod"] == "Bank Transfer"
        assert rows[1]["transactionType"] == "Payment"
        assert rows[1]["receiptNumber"] == "REC-002"
