from datetime import date
from decimal import Decimal
from model_bakery.baker import make_recipe
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from compliance.tests.utils.compliance_test_helper import ComplianceTestHelper
from registration.utils import custom_reverse_lazy
from unittest.mock import patch


MOCK_REPORTING_YEAR = date.today().year - 1


class TestElicensingInvoicesEndpoint(CommonTestSetup):
    @patch(
        "compliance.service.elicensing_invoice_service.ElicensingInvoiceService.get_elicensing_invoice_for_dashboard"
    )
    def test_get_elicensing_invoices_list_success_for_irc_user(self, mock_get_invoices):
        # Arrange
        # first invoice
        test_data = ComplianceTestHelper.build_test_data(reporting_year=MOCK_REPORTING_YEAR)

        invoice_1 = make_recipe(
            "compliance.tests.utils.elicensing_invoice",
            due_date=date(2025, 7, 1),
        )
        # obligation
        make_recipe(
            "compliance.tests.utils.compliance_obligation",
            compliance_report_version=test_data.compliance_report_version,
            fee_amount_dollars=Decimal("300.00"),
            fee_date=date(2025, 6, 1),
            obligation_id="25-0001-2",
            elicensing_invoice=invoice_1,
        )

        # second invoice
        test_data_2 = ComplianceTestHelper.build_test_data(reporting_year=MOCK_REPORTING_YEAR)

        invoice_2 = make_recipe(
            "compliance.tests.utils.elicensing_invoice",
            due_date=date(2025, 7, 1),
        )
        # obligation
        make_recipe(
            "compliance.tests.utils.compliance_obligation",
            compliance_report_version=test_data_2.compliance_report_version,
            fee_amount_dollars=Decimal("300.00"),
            fee_date=date(2025, 6, 1),
            obligation_id="25-0001-2",
            elicensing_invoice=invoice_2,
        )

        # Mock the service to return both versions
        mock_get_invoices.return_value = [invoice_1, invoice_2]

        # Act
        response = TestUtils.mock_get_with_auth_role(
            self,
            "cas_analyst",
            custom_reverse_lazy("get_elicensing_invoice_list"),
        )

        # Assert
        assert response.status_code == 200
        response_data = response.json()

        # Verify the paginated response structure
        assert response_data.keys() == {'count', 'items'}
        assert response_data['count'] == 2

        # Verify the fields in both results
        items = response_data["items"]
        assert len(items) == 2, "Expected 2 results"

        # Verify all keys present
        data = response_data["items"][0]

        expected_keys = {
            "compliance_period",
            "operator_legal_name",
            "operation_name",
            "invoice_total",
            "total_adjustments",
            "total_payments",
            "invoice_type",
        }

        assert expected_keys <= data.keys(), f"Missing keys: {expected_keys - data.keys()}"
