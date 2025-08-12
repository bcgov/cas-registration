import json
from unittest.mock import patch
from registration.utils import custom_reverse_lazy
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from model_bakery.baker import make_recipe


class TestGenerateComplianceReportVersionInvoice(CommonTestSetup):
    @patch("compliance.service.compliance_invoice_service.ComplianceInvoiceService.generate_obligation_invoice_pdf")
    def test_get_invoice_success(self, mock_generate_obligation_invoice_pdf):
        # Arrange
        pdf_bytes = b"%PDF content"
        mock_generate_obligation_invoice_pdf.return_value = (iter([pdf_bytes]), "invoice.pdf", len(pdf_bytes))

        operator = make_recipe("registration.tests.utils.operator")
        TestUtils.authorize_current_user_as_operator_user(self, operator)
        compliance_report_version = make_recipe(
            "compliance.tests.utils.compliance_report_version",
            compliance_report__report__operator=operator,
        )

        # Act
        response = TestUtils.mock_get_with_auth_role(
            self,
            "industry_user",
            custom_reverse_lazy(
                "generate_compliance_report_version_invoice",
                kwargs={"compliance_report_version_id": compliance_report_version.id},
            ),
        )

        # Assert
        assert response.status_code == 200
        assert response["Content-Type"] == "application/pdf"
        assert response["Content-Disposition"] == 'attachment; filename="invoice.pdf"'
        assert response["Content-Length"] == str(len(pdf_bytes))
        assert b"".join(response.streaming_content) == pdf_bytes

        mock_generate_obligation_invoice_pdf.assert_called_once_with(compliance_report_version.id)

    @patch("compliance.service.compliance_invoice_service.ComplianceInvoiceService.generate_obligation_invoice_pdf")
    def test_get_invoice_error_from_service(self, mock_generate_obligation_invoice_pdf):
        # Arrange: simulate an error result from the service
        mock_generate_obligation_invoice_pdf.return_value = {
            "errors": {"unexpected_error": "Mocked: PDF generation failed"}
        }
        operator = make_recipe("registration.tests.utils.operator")
        TestUtils.authorize_current_user_as_operator_user(self, operator)
        compliance_report_version = make_recipe(
            "compliance.tests.utils.compliance_report_version",
            compliance_report__report__operator=operator,
        )

        # Act
        response = TestUtils.mock_get_with_auth_role(
            self,
            "industry_user",
            custom_reverse_lazy(
                "generate_compliance_report_version_invoice",
                kwargs={"compliance_report_version_id": compliance_report_version.id},
            ),
        )

        # Assert
        assert response.status_code == 400
        assert response["Content-Type"] == "application/json"

        # ✅ Properly consume the streaming response
        raw_bytes = b"".join(response.streaming_content)
        parsed = json.loads(raw_bytes.decode("utf-8"))
        assert parsed == {"errors": {"unexpected_error": "Mocked: PDF generation failed"}}

        mock_generate_obligation_invoice_pdf.assert_called_once_with(compliance_report_version.id)
