from unittest.mock import patch
from registration.utils import custom_reverse_lazy
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from model_bakery.baker import make_recipe


class TestGenerateComplianceReportVersionInvoice(CommonTestSetup):
    @patch("compliance.service.compliance_invoice_service.ComplianceInvoiceService.generate_invoice_pdf")
    def test_get_invoice_success(self, mock_generate_invoice_pdf):
        # Arrange
        mock_generate_invoice_pdf.return_value = (b"PDF content", "invoice.pdf", 100)
        TestUtils.authorize_current_user_as_operator_user(
            self, operator=make_recipe('registration.tests.utils.operator')
        )

        # Act
        response = TestUtils.mock_get_with_auth_role(
            self,
            "industry_user",
            custom_reverse_lazy(
                "generate_compliance_report_version_invoice", kwargs={"compliance_report_version_id": 123}
            ),
        )

        # Assert
        assert response.status_code == 200
        mock_generate_invoice_pdf.assert_called_once_with(123)
