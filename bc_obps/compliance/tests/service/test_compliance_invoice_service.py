import json
from compliance.models.elicensing_adjustment import ElicensingAdjustment
import pytest
from datetime import date
from django.utils import timezone
from decimal import Decimal
from unittest.mock import patch
from model_bakery.baker import make_recipe

from compliance.service.compliance_invoice_service import ComplianceInvoiceService
from compliance.models import ComplianceChargeRate
from compliance.models import ElicensingInvoice, ElicensingLineItem
from reporting.models.reporting_year import ReportingYear
from service.reporting_year_service import ReportingYearService


pytestmark = pytest.mark.django_db


class TestComplianceInvoiceService:
    def setup_method(self):

        # 1
        self.report = make_recipe(
            "compliance.tests.utils.report", reporting_year=ReportingYearService.get_current_reporting_year())
        
        self.report_version=make_recipe(
            "reporting.tests.utils.report_version", report=self.report)
        
        self.report_operation = make_recipe(
            "reporting.tests.utils.report_operation",report_version=self.report_version
        )
        
        self.compliance_report = make_recipe(
            "compliance.tests.utils.compliance_report", report=self.report)
        
        self.report_compliance_summary = make_recipe(
            "compliance.tests.utils.report_compliance_summary",report_version=self.report_version)
        
        self.compliance_report_version = make_recipe(
            "compliance.tests.utils.compliance_report_version",
           compliance_report=self.compliance_report
        )
      
        
        

        self.address = make_recipe("registration.tests.utils.address")
        self.operator = make_recipe("registration.tests.utils.operator", physical_address=self.address)



        # Set up invoice and line items
        self.invoice = make_recipe(
            "compliance.tests.utils.elicensing_invoice",
            due_date=date(2025, 7, 1)
        )
        self.line_item = make_recipe(
            "compliance.tests.utils.elicensing_line_item",
            elicensing_invoice=self.invoice,
            fee_date=date(2025, 6, 1),
            base_amount=Decimal("300.00"),
            description="Compliance Fee",
        )

        self.obligation = make_recipe(
            "compliance.tests.utils.compliance_obligation",
            compliance_report_version=self.compliance_report_version,
            fee_amount_dollars=Decimal("300.00"),
            fee_date=date(2025, 6, 1),
            obligation_id="25-0001-1",
            elicensing_invoice=self.invoice
        )
        # Add payment and adjustment
        make_recipe("compliance.tests.utils.elicensing_payment", elicensing_line_item=self.line_item)
        make_recipe("compliance.tests.utils.elicensing_adjustment", elicensing_line_item=self.line_item)

        # Add penalty
        make_recipe("compliance.tests.utils.compliance_penalty", compliance_obligation=self.obligation)

    @patch("compliance.service.compliance_invoice_service.PDFGeneratorService.generate_pdf")
    @patch(
        "compliance.service.compliance_invoice_service.ComplianceReportVersionService.get_report_operation_by_compliance_report_version"
    )
    @patch(
        "compliance.service.compliance_invoice_service.ComplianceReportVersionService.get_obligation_by_compliance_report_version"
    )
    @patch("compliance.service.compliance_invoice_service.ComplianceChargeRate.objects.get")
    @patch(
        "compliance.service.compliance_invoice_service.ElicensingDataRefreshService.refresh_data_wrapper_by_compliance_report_version_id"
    )
    def test_generate_obligation_invoice_pdf_success(
        self,
        mock_refresh_data,
        mock_get_charge_rate,
        mock_get_obligation,
        mock_get_report_operation,
        mock_generate_pdf,
    ):
        # Patch fresh data response
        mock_refresh_data.return_value.invoice = self.invoice
        mock_refresh_data.return_value.data_is_fresh = True

        # Charge rate for billing
        mock_get_charge_rate.return_value = ComplianceChargeRate(rate=Decimal("2.00"))

        # Patch other services
        mock_get_obligation.return_value = self.obligation
        mock_get_report_operation.return_value = self.report_operation
        mock_generate_pdf.return_value = (b"%PDF mock", "invoice_INV-001_20250601.pdf", 2048)

        result = ComplianceInvoiceService.generate_obligation_invoice_pdf(self.compliance_report_version.id)

        assert isinstance(result, tuple)
        content, filename, size = result
        assert content.startswith(b"%PDF")
        assert filename.endswith(".pdf")
        assert size == 2048
        mock_generate_pdf.assert_called_once()

    @pytest.mark.parametrize(
        "fee_amount, payments, adjustments, expected_due, expected_billing_count",
        [
            (Decimal("300.00"), [], [], Decimal("300.00"), 1),
            (
                Decimal("300.00"),
                [{"amount": Decimal("100.00"), "date": date(2025, 6, 10), "description": "Partial Payment"}],
                [],
                Decimal("200.00"),
                2,
            ),
            (
                Decimal("300.00"),
                [],
                [{"amount": Decimal("-50.00"), "date": date(2025, 6, 12), "description": "Rebate"}],
                Decimal("250.00"),
                2,
            ),
            (
                Decimal("300.00"),
                [{"amount": Decimal("100.00"), "date": date(2025, 6, 10), "description": "Partial Payment"}],
                [{"amount": Decimal("-25.00"), "date": date(2025, 6, 12), "description": "Rebate"}],
                Decimal("175.00"),
                3,
            ),
            (None, [], [], Decimal("0.00"), 0),
        ],
    )
    def test_calculate_invoice_amount_due_parametrized(
        self, fee_amount, payments, adjustments, expected_due, expected_billing_count
    ):
        invoice: ElicensingInvoice = make_recipe("compliance.tests.utils.elicensing_invoice")

        if fee_amount is not None:
            line_item: ElicensingLineItem = make_recipe(
                "compliance.tests.utils.elicensing_line_item",
                elicensing_invoice=invoice,
                line_item_type=ElicensingLineItem.LineItemType.FEE,
                base_amount=fee_amount,
                fee_date=date(2025, 6, 1),
                description="Compliance Fee",
            )

            for p in payments:
                make_recipe(
                    "compliance.tests.utils.elicensing_payment",
                    elicensing_line_item=line_item,
                    amount=p["amount"],
                    received_date=p["date"],
                )

            for a in adjustments:
                make_recipe(
                    "compliance.tests.utils.elicensing_adjustment",
                    elicensing_line_item=line_item,
                    amount=a["amount"],
                    adjustment_date=a["date"],
                    reason=ElicensingAdjustment.Reason.COMPLIANCE_UNITS_APPLIED,
                    type="CREDIT",
                )

        # Act
        amount_due, billing_items = ComplianceInvoiceService.calculate_invoice_amount_due(invoice)

        # Assert
        assert amount_due == expected_due
        assert len(billing_items) == expected_billing_count

    @patch(
        "compliance.service.compliance_invoice_service.ComplianceReportVersionService.get_operator_by_compliance_report_version"
    )
    @patch(
        "compliance.service.compliance_invoice_service.ComplianceReportVersionService.get_report_operation_by_compliance_report_version"
    )
    @patch("compliance.service.compliance_invoice_service.ComplianceInvoiceService.calculate_invoice_amount_due")
    @patch("compliance.service.compliance_invoice_service.ComplianceInvoiceService.format_operator_address")
    def test_prepare_partial_invoice_context(
        self,
        mock_format_operator_address,
        mock_calculate_invoice_amount_due,
        mock_get_report_operation,
        mock_get_operator,
    ):
        # Arrange
        mock_format_operator_address.return_value = ("123 Main St", "City, BC  V1A 2B3")
        mock_calculate_invoice_amount_due.return_value = Decimal('263512.40'), [
            {
                'date': 'Aug 8, 2025',
                'description': '2024 GGIRCA Automatic Penalty for Obligation ID 1',
                'amount': '$1,263,512.40',
            },
            {'date': 'Aug 8, 2025', 'description': 'Payment 185262395', 'amount': '($1,000,000.00)'},
        ]
        mock_get_report_operation.return_value = self.report_operation

        mock_get_operator.return_value = self.operator

        obligation_id = self.obligation.obligation_id

        # Act
        context = ComplianceInvoiceService._prepare_partial_invoice_context(
            self.compliance_report_version.id,
            self.invoice,
            obligation_id,
        )

        # Assert
        assert context["operator_name"] == self.operator.legal_name
        assert context["operator_address_line1"] == "123 Main St"
        assert context["operator_address_line2"] == "City, BC  V1A 2B3"
        assert context["operation_name"] == self.report_operation.operation_name
        assert context["invoice_number"] == self.invoice.invoice_number
        assert context["invoice_due_date"] == self.invoice.due_date.strftime("%b %-d, %Y")
        assert context["invoice_printed_date"] == timezone.now().strftime("%b %-d, %Y")
        assert "logo_base64" in context

        assert context["billing_items"] == [
            {
                'date': 'Aug 8, 2025',
                'description': '2024 GGIRCA Automatic Penalty for Obligation ID 1',
                'amount': '$1,263,512.40',
            },
            {'date': 'Aug 8, 2025', 'description': 'Payment 185262395', 'amount': '($1,000,000.00)'},
        ]
        assert context["total_amount_due"] == '$263,512.40'
        assert context["compliance_obligation_id"] == obligation_id

    @patch("compliance.service.compliance_invoice_service.PDFGeneratorService.generate_pdf")
    @patch(
        "compliance.service.compliance_invoice_service.ComplianceReportVersionService.get_obligation_by_compliance_report_version"
    )
    @patch("compliance.service.compliance_invoice_service.ComplianceInvoiceService._prepare_partial_invoice_context")
    @patch(
        "compliance.service.compliance_invoice_service.ElicensingDataRefreshService.refresh_data_wrapper_by_compliance_report_version_id"
    )
    def test_generate_automatic_overdue_penalty_invoice_pdf_success(
        self,
        mock_refresh_data,
        mock__prepare_partial_invoice_context,
        mock_get_obligation,
        mock_generate_pdf,
    ):
        # Patch fresh data response
        mock_refresh_data.return_value.invoice = self.invoice
        mock_refresh_data.return_value.data_is_fresh = True

        # Patch other services
        mock_get_obligation.return_value = self.obligation
        mock_generate_pdf.return_value = (b"%PDF mock", "invoice_INV-001_20250601.pdf", 2048)
        mock__prepare_partial_invoice_context.return_value = {
            "operator_name": self.operator.legal_name,
            "operator_address_line1": "123 Main St",
            "operator_address_line2": "City, BC  V1A 2B3",
            "operation_name": self.report_operation.operation_name,
            "invoice_number": self.invoice.invoice_number,
            "invoice_due_date": self.invoice.due_date.strftime("%b %-d, %Y"),
            "invoice_printed_date": timezone.now().strftime("%b %-d, %Y"),
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
            "compliance_obligation_id": self.obligation.obligation_id,
        }

        result = ComplianceInvoiceService.generate_automatic_overdue_penalty_invoice_pdf(
            self.compliance_report_version.id
        )

        assert isinstance(result, tuple)
        content, filename, size = result
        assert content.startswith(b"%PDF")
        assert filename.endswith(".pdf")
        assert size == 2048
        mock_generate_pdf.assert_called_once()

    def test_create_pdf_response_returns_error(self):
        error_payload = {"errors": {"unexpected_error": "Mocked: PDF generation failed"}}
        response = ComplianceInvoiceService.create_pdf_response(error_payload)
        # Assert
        assert response.status_code == 400
        assert response["Content-Type"] == "application/json"

        # ✅ Properly consume the streaming response
        raw_bytes = b"".join(response.streaming_content)
        parsed = json.loads(raw_bytes.decode("utf-8"))
        assert parsed == {"errors": {"unexpected_error": "Mocked: PDF generation failed"}}

    def test_create_pdf_response_success(self):

        mock_pdf = (b"%PDF mock", "invoice_INV-001_20250601.pdf", 2048)

        response = ComplianceInvoiceService.create_pdf_response(mock_pdf)

        assert response.status_code == 200
        assert response['Content-Type'] == 'application/pdf'
        assert response["Content-Disposition"] == 'attachment; filename="invoice_INV-001_20250601.pdf"'
        assert response["Content-Length"] == '2048'



    @patch("service.reporting_year_service.ReportingYearService.get_current_reporting_year")
    @patch("compliance.service.compliance_invoice_service.ComplianceInvoiceService.calculate_invoice_amount_due")
    def test_get_elicensing_invoice_for_dashboard_for_irc_user(self, mock_calculate_invoice,mock_get_year):
        mock_calculate_invoice.return_value = (None, None, 100, 50, 10)
        # additional report for current year
        report_2 = make_recipe(
            "compliance.tests.utils.report", reporting_year=ReportingYear.objects.get(reporting_year=date.today().year -1 ))
        
      
        
        report_version_2=make_recipe(
            "reporting.tests.utils.report_version", report=report_2)
        
        compliance_report_2 = make_recipe(
            "compliance.tests.utils.compliance_report", report=report_2)
        
        report_compliance_summary_2 = make_recipe(
            "compliance.tests.utils.report_compliance_summary",report_version=report_version_2)
        

        compliance_report_version_2 = make_recipe(
            "compliance.tests.utils.compliance_report_version",
           compliance_report=compliance_report_2, report_compliance_summary=report_compliance_summary_2
        )
        invoice_2 = make_recipe(
    "compliance.tests.utils.elicensing_invoice",
    due_date=date(2025, 7, 1),
)
        # obligation
        make_recipe(
    "compliance.tests.utils.compliance_obligation",
    compliance_report_version=compliance_report_version_2,
    fee_amount_dollars=Decimal("300.00"),
    fee_date=date(2025, 6, 1),
    obligation_id="25-0001-2",
    elicensing_invoice=invoice_2,
)
        # additional report for different year - should not be included
        breakpoint()
        report_2 = make_recipe(
            "compliance.tests.utils.report", reporting_year=ReportingYear.objects.get(reporting_year=2023))
        
        report_version_2=make_recipe(
            "reporting.tests.utils.report_version", report=report_2)
        
        report_operation_2 = make_recipe(
            "reporting.tests.utils.report_operation",report_version=report_version_2
        )
        compliance_report_2 = make_recipe(
            "compliance.tests.utils.compliance_report", report=report_2)
        
        report_compliance_summary_2 = make_recipe(
            "compliance.tests.utils.report_compliance_summary",report_version=report_version_2)
        

        compliance_report_version_2 = make_recipe(
            "compliance.tests.utils.compliance_report_version",
           compliance_report=compliance_report_2, report_compliance_summary=report_compliance_summary_2
        )
        invoice_2 = make_recipe(
    "compliance.tests.utils.elicensing_invoice",
    due_date=date(2025, 7, 1),
)
        # obligation
        make_recipe(
    "compliance.tests.utils.compliance_obligation",
    compliance_report_version=compliance_report_version_2,
    fee_amount_dollars=Decimal("300.00"),
    fee_date=date(2025, 6, 1),
    obligation_id="25-0001-2",
    elicensing_invoice=invoice_2,
)
        

        cas_analyst = make_recipe("registration.tests.utils.cas_analyst")

        
        result = ComplianceInvoiceService.get_elicensing_invoice_for_dashboard(cas_analyst.user_guid)
        mock_get_year.assert_called_once()
        mock_calculate_invoice.assert_called_once()
        assert result.count() == 3

        assert result[0].invoice_type == "Compliance obligation"
        result[0].invoice_total = 100
        result[0].total_payments = 50
        result[0].total_adjustments = 10
        result[0].report_operation = self.report_operation
        breakpoint()
        result[0].reporting_year = ReportingYear.objects.get(reporting_year=date.today().year -1 )

        assert result[1].invoice_type == "Automatic overdue penalty"
        result[1].invoice_total = 100
        result[1].total_payments = 50
        result[1].total_adjustments = 10
        result[1].report_operation = self.report_operation
        result[1].reporting_year = ReportingYear.objects.get(reporting_year=date.today().year -1 )

        assert result[2].invoice_type == "Compliance obligation"
        result[2].invoice_total = 100
        result[2].total_payments = 50
        result[2].total_adjustments = 10
        result[2].report_operation = report_operation_2
        result[2].reporting_year = ReportingYear.objects.get(reporting_year=date.today().year -1 )

        