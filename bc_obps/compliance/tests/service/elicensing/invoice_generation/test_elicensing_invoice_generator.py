import json
from datetime import date
from decimal import Decimal
from unittest.mock import patch

from django.utils import timezone
from model_bakery.baker import make_recipe
import pytest

from compliance.models import (
    ComplianceChargeRate,
    CompliancePenalty,
    ComplianceReportVersion,
    ElicensingLineItem,
)
from compliance.service.elicensing.invoice_generation.elicensing_invoice_generator import (
    ElicensingInvoiceGeneratorService,
)
from compliance.service.elicensing.elicensing_invoice_service import STRFTIME_FORMAT
from compliance.tests.utils.compliance_test_helper import ComplianceTestHelper
from reporting.models import ReportOperation
from reporting.service.reporting_year_service import ReportingYearService

pytestmark = pytest.mark.django_db


class TestElicensingInvoiceGeneratorService:
    def setup_method(self):
        self.test_data = ComplianceTestHelper.build_test_data(
            reporting_year=ReportingYearService.get_current_reporting_year().reporting_year,
            crv_status=ComplianceReportVersion.ComplianceStatus.OBLIGATION_NOT_MET,
            create_invoice_data=True,
        )
        self.test_data.invoice.due_date = date(2025, 8, 1)
        self.test_data.invoice.save()

        self.address = make_recipe("registration.tests.utils.address")

        self.test_data.compliance_obligation.fee_amount_dollars = Decimal("300.00")
        self.test_data.compliance_obligation.save()
        # Add payments and adjustments
        make_recipe("compliance.tests.utils.elicensing_payment", elicensing_line_item=self.test_data.fee, amount=201)
        make_recipe("compliance.tests.utils.elicensing_payment", elicensing_line_item=self.test_data.fee, amount=49)
        make_recipe("compliance.tests.utils.elicensing_adjustment", elicensing_line_item=self.test_data.fee, amount=25)
        make_recipe("compliance.tests.utils.elicensing_adjustment", elicensing_line_item=self.test_data.fee, amount=25)

        # Add FAA Interest + payment to the first invoice
        self.faa_line_item = make_recipe(
            "compliance.tests.utils.elicensing_line_item",
            elicensing_invoice=self.test_data.invoice,
            line_item_type=ElicensingLineItem.LineItemType.INTEREST,
            base_amount=Decimal("20.00"),
            fee_date=date(2025, 1, 26),
            description="Interest to Payment Received Date",
        )

        # Add automatic overdue penalty
        self.penalty_invoice = make_recipe("compliance.tests.utils.elicensing_invoice", due_date=date(2025, 8, 1))
        make_recipe(
            "compliance.tests.utils.compliance_penalty",
            compliance_obligation=self.test_data.compliance_obligation,
            elicensing_invoice=self.penalty_invoice,
            penalty_type=CompliancePenalty.PenaltyType.AUTOMATIC_OVERDUE,
        )

        # Add late submission penalty using a separate invoice
        self.late_penalty_invoice = make_recipe("compliance.tests.utils.elicensing_invoice", due_date=date(2025, 8, 1))
        make_recipe(
            "compliance.tests.utils.compliance_penalty",
            compliance_obligation=self.test_data.compliance_obligation,
            elicensing_invoice=self.late_penalty_invoice,
            penalty_type=CompliancePenalty.PenaltyType.LATE_SUBMISSION,
        )

    @patch(
        "compliance.service.elicensing.invoice_generation.elicensing_invoice_generator.PDFGeneratorService.generate_pdf"
    )
    @patch(
        "compliance.service.elicensing.invoice_generation.elicensing_invoice_generator.ComplianceReportVersionService.get_report_operation_by_compliance_report_version"
    )
    @patch(
        "compliance.service.elicensing.invoice_generation.elicensing_invoice_generator.ComplianceReportVersionService.get_obligation_by_compliance_report_version"
    )
    @patch(
        "compliance.service.elicensing.invoice_generation.elicensing_invoice_generator.ComplianceChargeRate.objects.get"
    )
    @patch(
        "compliance.service.elicensing.invoice_generation.elicensing_invoice_generator.ElicensingDataRefreshService.refresh_data_wrapper_by_compliance_report_version_id"
    )
    def test_generate_obligation_invoice_pdf_success(
        self,
        mock_refresh_data,
        mock_get_charge_rate,
        mock_get_obligation,
        mock_get_report_operation,
        mock_generate_pdf,
    ):
        # Patch fresh data response for obligation invoice
        mock_refresh_data.return_value.invoice = self.test_data.invoice
        mock_refresh_data.return_value.data_is_fresh = True

        # Charge rate for billing
        mock_get_charge_rate.return_value = ComplianceChargeRate(rate=Decimal("2.00"))

        # Patch other services
        mock_get_obligation.return_value = self.test_data.compliance_obligation
        mock_get_report_operation.return_value = ReportOperation.objects.get(
            report_version=self.test_data.report_version
        )
        mock_generate_pdf.return_value = (b"%PDF mock", "invoice_INV-001_20250601.pdf", 2048)

        result = ElicensingInvoiceGeneratorService.generate_obligation_invoice_pdf(
            self.test_data.compliance_report_version.id
        )

        assert isinstance(result, tuple)
        content, filename, size = result
        assert content.startswith(b"%PDF")
        assert filename.endswith(".pdf")
        assert size == 2048
        mock_generate_pdf.assert_called_once()
        expected_date = timezone.now().strftime("%Y%m%d")
        assert (
            mock_generate_pdf.call_args.kwargs["filename"]
            == f"OBPS Compliance Invoice {self.test_data.invoice.invoice_number}_{expected_date}.pdf"
        )

    @patch(
        "compliance.service.elicensing.invoice_generation.elicensing_invoice_generator.PDFGeneratorService.generate_pdf"
    )
    @patch(
        "compliance.service.elicensing.invoice_generation.elicensing_invoice_generator.ComplianceReportVersionService.get_obligation_by_compliance_report_version"
    )
    @patch(
        "compliance.service.elicensing.invoice_generation.elicensing_invoice_generator.ElicensingInvoiceContextService.prepare_partial_invoice_context"
    )
    @patch(
        "compliance.service.elicensing.invoice_generation.elicensing_invoice_generator.ElicensingDataRefreshService.refresh_data_wrapper_by_compliance_report_version_id"
    )
    def test_generate_late_submission_penalty_invoice_pdf_success(
        self,
        mock_refresh_data,
        mock_prepare_partial_invoice_context,
        mock_get_obligation,
        mock_generate_pdf,
    ):
        # Patch fresh data response for late submission penalty invoice
        mock_refresh_data.return_value.invoice = self.late_penalty_invoice
        mock_refresh_data.return_value.data_is_fresh = True

        # Patch other services
        mock_get_obligation.return_value = self.test_data.compliance_obligation
        mock_generate_pdf.return_value = (b"%PDF mock", "invoice_INV-001_20250601.pdf", 2048)
        mock_prepare_partial_invoice_context.return_value = {
            "operator_name": self.test_data.operation.operator.legal_name,
            "operator_address_line1": "123 Main St",
            "operator_address_line2": "City, BC  V1A 2B3",
            "operation_name": ReportOperation.objects.get(report_version=self.test_data.report_version),
            "invoice_number": self.test_data.compliance_obligation.elicensing_invoice.invoice_number,
            "invoice_due_date": self.test_data.compliance_obligation.elicensing_invoice.due_date.strftime(
                STRFTIME_FORMAT
            ),
            "invoice_printed_date": timezone.now().strftime(STRFTIME_FORMAT),
            "logo_base64": "data:image/png;base64,...",
            "billing_items": [
                {
                    "date": "Aug 8, 2025",
                    "description": "2024 GGIRCA Automatic Penalty for Obligation ID 1",
                    "amount": "$1,263,512.40",
                },
                {
                    "date": "Aug 8, 2025",
                    "description": "Payment 185262395",
                    "amount": "($1,000,000.00)",
                },
            ],
            "total_amount_due": "$263,512.40",
            "compliance_obligation_id": self.test_data.compliance_obligation.obligation_id,
        }

        result = ElicensingInvoiceGeneratorService.generate_late_submission_penalty_invoice_pdf(
            self.test_data.compliance_report_version.id
        )

        assert isinstance(result, tuple)
        content, filename, size = result
        assert content.startswith(b"%PDF")
        assert filename.endswith(".pdf")
        assert size == 2048
        mock_generate_pdf.assert_called_once()
        expected_date = timezone.now().strftime("%Y%m%d")
        assert (
            mock_generate_pdf.call_args.kwargs["filename"] == f"OBPS GGEAPAR Penalty Invoice "
            f"{self.test_data.compliance_obligation.elicensing_invoice.invoice_number}_{expected_date}.pdf"
        )

    @patch(
        "compliance.service.elicensing.invoice_generation.elicensing_invoice_generator.PDFGeneratorService.generate_pdf"
    )
    @patch(
        "compliance.service.elicensing.invoice_generation.elicensing_invoice_generator.ComplianceReportVersionService.get_obligation_by_compliance_report_version"
    )
    @patch(
        "compliance.service.elicensing.invoice_generation.elicensing_invoice_generator.ElicensingInvoiceContextService.prepare_partial_invoice_context"
    )
    @patch(
        "compliance.service.elicensing.invoice_generation.elicensing_invoice_generator.ElicensingDataRefreshService.refresh_data_wrapper_by_compliance_report_version_id"
    )
    def test_generate_automatic_overdue_penalty_invoice_pdf_success(
        self,
        mock_refresh_data,
        mock_prepare_partial_invoice_context,
        mock_get_obligation,
        mock_generate_pdf,
    ):
        # Patch fresh data response for penalty invoice
        mock_refresh_data.return_value.invoice = self.penalty_invoice
        mock_refresh_data.return_value.data_is_fresh = True

        # Patch other services
        mock_get_obligation.return_value = self.test_data.compliance_obligation
        mock_generate_pdf.return_value = (b"%PDF mock", "invoice_INV-001_20250601.pdf", 2048)
        mock_prepare_partial_invoice_context.return_value = {
            "operator_name": self.test_data.operation.operator.legal_name,
            "operator_address_line1": "123 Main St",
            "operator_address_line2": "City, BC  V1A 2B3",
            "operation_name": ReportOperation.objects.get(report_version=self.test_data.report_version).operation_name,
            "invoice_number": self.test_data.compliance_obligation.elicensing_invoice.invoice_number,
            "invoice_due_date": self.test_data.compliance_obligation.elicensing_invoice.due_date.strftime(
                STRFTIME_FORMAT
            ),
            "invoice_printed_date": timezone.now().strftime(STRFTIME_FORMAT),
            "logo_base64": "data:image/png;base64,...",
            "billing_items": [
                {
                    "date": "Aug 8, 2025",
                    "description": "2024 GGIRCA Automatic Penalty for Obligation ID 1",
                    "amount": "$1,263,512.40",
                },
                {
                    "date": "Aug 8, 2025",
                    "description": "Payment 185262395",
                    "amount": "($1,000,000.00)",
                },
            ],
            "total_amount_due": "$263,512.40",
            "compliance_obligation_id": self.test_data.compliance_obligation.obligation_id,
        }

        result = ElicensingInvoiceGeneratorService.generate_automatic_overdue_penalty_invoice_pdf(
            self.test_data.compliance_report_version.id
        )

        assert isinstance(result, tuple)
        content, filename, size = result
        assert content.startswith(b"%PDF")
        assert filename.endswith(".pdf")
        assert size == 2048
        mock_generate_pdf.assert_called_once()
        expected_date = timezone.now().strftime("%Y%m%d")
        assert (
            mock_generate_pdf.call_args.kwargs["filename"] == f"OBPS Automatic Overdue Penalty Invoice "
            f"{self.test_data.compliance_obligation.elicensing_invoice.invoice_number}_{expected_date}.pdf"
        )

    def test_create_pdf_response_returns_error(self):
        error_payload = {"errors": {"unexpected_error": "Mocked: PDF generation failed"}}
        response = ElicensingInvoiceGeneratorService.create_pdf_response(error_payload)
        # Assert
        assert response.status_code == 400
        assert response["Content-Type"] == "application/json"

        # ✅ Properly consume the streaming response
        raw_bytes = b"".join(response.streaming_content)
        parsed = json.loads(raw_bytes.decode("utf-8"))
        assert parsed == {"errors": {"unexpected_error": "Mocked: PDF generation failed"}}

    def test_create_pdf_response_success(self):

        mock_pdf = (b"%PDF mock", "invoice_INV-001_20250601.pdf", 2048)

        response = ElicensingInvoiceGeneratorService.create_pdf_response(mock_pdf)

        assert response.status_code == 200
        assert response['Content-Type'] == 'application/pdf'
        assert response["Content-Disposition"] == 'attachment; filename="invoice_INV-001_20250601.pdf"'
        assert response["Content-Length"] == '2048'
