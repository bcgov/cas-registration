import json
from unittest.mock import patch
from registration.utils import custom_reverse_lazy
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from model_bakery.baker import make_recipe


class TestGenerateComplianceReportVersionInvoice(CommonTestSetup):
    @patch("compliance.service.compliance_invoice_service.ComplianceInvoiceService.prepare_invoice_context")
    @patch("compliance.service.compliance_invoice_service.ComplianceInvoiceService.generate_invoice_pdf")
    def test_get_invoice_success(self, mock_generate_invoice_pdf, mock_prepare_invoice_context):
        # Arrange: make prepare_invoice_context return a minimal valid context
        context_dict = {"invoice_number": "INV-123"}
        mock_prepare_invoice_context.return_value = context_dict

        # And make generate_invoice_pdf return an iterator, filename, and size
        mock_generate_invoice_pdf.return_value = (iter([b"PDF content"]), "invoice.pdf", 100)

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

        # Assert: 200 OK, and methods called correctly
        assert response.status_code == 200

        mock_prepare_invoice_context.assert_called_once_with(123)
        mock_generate_invoice_pdf.assert_called_once_with(123, context_dict)

    @patch("compliance.service.compliance_invoice_service.ComplianceInvoiceService.prepare_invoice_context")
    def test_get_invoice_error_from_service(self, mock_prepare_invoice_context):
        # Arrange: simulate the service returning an errors dict
        mock_prepare_invoice_context.return_value = {
            "errors": {"build_fee_items_error": "Mocked: failed to build fee_items (sentinel)."}
        }

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

        # Assert: 400 with the same errors payload
        assert response.status_code == 400

        # Consume streaming_content and parse JSON
        raw_bytes = b"".join(response.streaming_content)
        parsed = json.loads(raw_bytes.decode("utf-8"))
        assert parsed == {"errors": {"build_fee_items_error": "Mocked: failed to build fee_items (sentinel)."}}
