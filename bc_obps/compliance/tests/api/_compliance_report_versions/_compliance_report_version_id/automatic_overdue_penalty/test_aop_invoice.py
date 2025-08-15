from unittest.mock import ANY, patch
from django.http import StreamingHttpResponse
from registration.utils import custom_reverse_lazy
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from model_bakery.baker import make_recipe


class TestGenerateComplianceReportVersionPenaltyInvoice(CommonTestSetup):
    @patch(
        "compliance.service.compliance_invoice_service.ComplianceInvoiceService.generate_automatic_overdue_penalty_invoice_pdf"
    )
    @patch("compliance.service.compliance_invoice_service.ComplianceInvoiceService.create_pdf_response")
    def test_get_invoice_success(self, mock_create_pdf_response, mock_generate_automatic_overdue_penalty_invoice_pdf):
        # Arrange
        pdf_bytes = b"%PDF content"
        streaming_content = iter([pdf_bytes])

        mock_generate_automatic_overdue_penalty_invoice_pdf.return_value = (
            iter([pdf_bytes]),
            "invoice.pdf",
            len(pdf_bytes),
        )
        mock_create_pdf_response.return_value = StreamingHttpResponse(
            streaming_content=streaming_content, content_type="application/pdf"
        )

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
                "generate_compliance_report_version_automatic_overdue_penalty_invoice",
                kwargs={"compliance_report_version_id": compliance_report_version.id},
            ),
        )

        # Assert
        assert response.status_code == 200

        mock_generate_automatic_overdue_penalty_invoice_pdf.assert_called_once_with(compliance_report_version.id)
        mock_create_pdf_response.assert_called_once_with((ANY, 'invoice.pdf', 12))

    @patch(
        "compliance.service.compliance_invoice_service.ComplianceInvoiceService.generate_automatic_overdue_penalty_invoice_pdf"
    )
    def test_get_invoice_error_from_service(self, mock_generate_automatic_overdue_penalty_invoice_pdf):
        # Arrange: simulate an error result from the service
        mock_generate_automatic_overdue_penalty_invoice_pdf.return_value = {
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
                "generate_compliance_report_version_automatic_overdue_penalty_invoice",
                kwargs={"compliance_report_version_id": compliance_report_version.id},
            ),
        )

        # Assert
        assert response.status_code == 400
        mock_generate_automatic_overdue_penalty_invoice_pdf.assert_called_once_with(compliance_report_version.id)
