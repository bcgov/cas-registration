import json
from compliance.models.elicensing_adjustment import ElicensingAdjustment
from compliance.tests.service.test_compliance_dashboard_service import _NoopFilters
import pytest
from datetime import date
from django.utils import timezone
from decimal import Decimal
from unittest.mock import patch
from model_bakery.baker import make_recipe

from compliance.service.elicensing_invoice_service import ElicensingInvoiceService
from compliance.models import (
    ComplianceChargeRate,
    ElicensingInvoice,
    ElicensingLineItem,
    CompliancePenalty,
    ComplianceReportVersion,
)
from reporting.models import ReportOperation
from service.reporting_year_service import ReportingYearService
from compliance.tests.utils.compliance_test_helper import ComplianceTestHelper

pytestmark = pytest.mark.django_db
MOCK_REPORTING_YEAR = date.today().year - 1


class TestElicensingInvoiceService:
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

    @patch("compliance.service.elicensing_invoice_service.PDFGeneratorService.generate_pdf")
    @patch(
        "compliance.service.elicensing_invoice_service.ComplianceReportVersionService.get_report_operation_by_compliance_report_version"
    )
    @patch(
        "compliance.service.elicensing_invoice_service.ComplianceReportVersionService.get_obligation_by_compliance_report_version"
    )
    @patch("compliance.service.elicensing_invoice_service.ComplianceChargeRate.objects.get")
    @patch(
        "compliance.service.elicensing_invoice_service.ElicensingDataRefreshService.refresh_data_wrapper_by_compliance_report_version_id"
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

        result = ElicensingInvoiceService.generate_obligation_invoice_pdf(self.test_data.compliance_report_version.id)

        assert isinstance(result, tuple)
        content, filename, size = result
        assert content.startswith(b"%PDF")
        assert filename.endswith(".pdf")
        assert size == 2048
        mock_generate_pdf.assert_called_once()

    @patch("compliance.service.elicensing_invoice_service.PDFGeneratorService.generate_pdf")
    @patch(
        "compliance.service.elicensing_invoice_service.ComplianceReportVersionService.get_obligation_by_compliance_report_version"
    )
    @patch("compliance.service.elicensing_invoice_service.ElicensingInvoiceService._prepare_partial_invoice_context")
    @patch(
        "compliance.service.elicensing_invoice_service.ElicensingDataRefreshService.refresh_data_wrapper_by_compliance_report_version_id"
    )
    def test_generate_late_submission_penalty_invoice_pdf_success(
        self,
        mock_refresh_data,
        mock__prepare_partial_invoice_context,
        mock_get_obligation,
        mock_generate_pdf,
    ):
        # Patch fresh data response for late submission penalty invoice
        mock_refresh_data.return_value.invoice = self.late_penalty_invoice
        mock_refresh_data.return_value.data_is_fresh = True

        # Patch other services
        mock_get_obligation.return_value = self.test_data.compliance_obligation
        mock_generate_pdf.return_value = (b"%PDF mock", "invoice_INV-001_20250601.pdf", 2048)
        mock__prepare_partial_invoice_context.return_value = {
            "operator_name": self.test_data.operation.operator.legal_name,
            "operator_address_line1": "123 Main St",
            "operator_address_line2": "City, BC  V1A 2B3",
            "operation_name": ReportOperation.objects.get(report_version=self.test_data.report_version),
            "invoice_number": self.test_data.compliance_obligation.elicensing_invoice.invoice_number,
            "invoice_due_date": self.test_data.compliance_obligation.elicensing_invoice.due_date.strftime("%b %-d, %Y"),
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
            "compliance_obligation_id": self.test_data.compliance_obligation.obligation_id,
        }

        result = ElicensingInvoiceService.generate_late_submission_penalty_invoice_pdf(
            self.test_data.compliance_report_version.id
        )

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
        amount_due, billing_items, _, _, _ = ElicensingInvoiceService.calculate_invoice_amount_due(invoice)

        # Assert
        assert amount_due == expected_due
        assert len(billing_items) == expected_billing_count

    @patch(
        "compliance.service.elicensing_invoice_service.ComplianceReportVersionService.get_operator_by_compliance_report_version"
    )
    @patch(
        "compliance.service.elicensing_invoice_service.ComplianceReportVersionService.get_report_operation_by_compliance_report_version"
    )
    @patch("compliance.service.elicensing_invoice_service.ElicensingInvoiceService.calculate_invoice_amount_due")
    @patch("compliance.service.elicensing_invoice_service.ElicensingInvoiceService.format_operator_address")
    def test_prepare_partial_invoice_context(
        self,
        mock_format_operator_address,
        mock_calculate_invoice_amount_due,
        mock_get_report_operation,
        mock_get_operator,
    ):
        # Arrange
        mock_format_operator_address.return_value = ("123 Main St", "City, BC  V1A 2B3")
        mock_calculate_invoice_amount_due.return_value = (
            Decimal('263512.40'),
            [
                {
                    'date': 'Aug 8, 2025',
                    'description': '2024 GGIRCA Automatic Penalty for Obligation ID 1',
                    'amount': '$1,263,512.40',
                },
                {'date': 'Aug 8, 2025', 'description': 'Payment 185262395', 'amount': '($1,000,000.00)'},
            ],
            None,
            None,
            None,
        )
        mock_get_report_operation.return_value = ReportOperation.objects.get(
            report_version=self.test_data.report_version
        )

        mock_get_operator.return_value = self.test_data.operation.operator

        obligation_id = self.test_data.compliance_obligation.obligation_id

        # Act
        context = ElicensingInvoiceService._prepare_partial_invoice_context(
            self.test_data.compliance_report_version.id,
            self.test_data.compliance_obligation.elicensing_invoice,
            obligation_id,
        )

        # Assert
        assert context["operator_name"] == self.test_data.operation.operator.legal_name
        assert context["operator_address_line1"] == "123 Main St"
        assert context["operator_address_line2"] == "City, BC  V1A 2B3"
        assert (
            context["operation_name"]
            == ReportOperation.objects.get(report_version=self.test_data.report_version).operation_name
        )
        assert context["invoice_number"] == self.test_data.compliance_obligation.elicensing_invoice.invoice_number
        assert context["invoice_due_date"] == self.test_data.compliance_obligation.elicensing_invoice.due_date.strftime(
            "%b %-d, %Y"
        )
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

    @patch("compliance.service.elicensing_invoice_service.PDFGeneratorService.generate_pdf")
    @patch(
        "compliance.service.elicensing_invoice_service.ComplianceReportVersionService.get_obligation_by_compliance_report_version"
    )
    @patch("compliance.service.elicensing_invoice_service.ElicensingInvoiceService._prepare_partial_invoice_context")
    @patch(
        "compliance.service.elicensing_invoice_service.ElicensingDataRefreshService.refresh_data_wrapper_by_compliance_report_version_id"
    )
    def test_generate_automatic_overdue_penalty_invoice_pdf_success(
        self,
        mock_refresh_data,
        mock__prepare_partial_invoice_context,
        mock_get_obligation,
        mock_generate_pdf,
    ):
        # Patch fresh data response for penalty invoice
        mock_refresh_data.return_value.invoice = self.penalty_invoice
        mock_refresh_data.return_value.data_is_fresh = True

        # Patch other services
        mock_get_obligation.return_value = self.test_data.compliance_obligation
        mock_generate_pdf.return_value = (b"%PDF mock", "invoice_INV-001_20250601.pdf", 2048)
        mock__prepare_partial_invoice_context.return_value = {
            "operator_name": self.test_data.operation.operator.legal_name,
            "operator_address_line1": "123 Main St",
            "operator_address_line2": "City, BC  V1A 2B3",
            "operation_name": ReportOperation.objects.get(report_version=self.test_data.report_version).operation_name,
            "invoice_number": self.test_data.compliance_obligation.elicensing_invoice.invoice_number,
            "invoice_due_date": self.test_data.compliance_obligation.elicensing_invoice.due_date.strftime("%b %-d, %Y"),
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
            "compliance_obligation_id": self.test_data.compliance_obligation.obligation_id,
        }

        result = ElicensingInvoiceService.generate_automatic_overdue_penalty_invoice_pdf(
            self.test_data.compliance_report_version.id
        )

        assert isinstance(result, tuple)
        content, filename, size = result
        assert content.startswith(b"%PDF")
        assert filename.endswith(".pdf")
        assert size == 2048
        mock_generate_pdf.assert_called_once()

    def test_create_pdf_response_returns_error(self):
        error_payload = {"errors": {"unexpected_error": "Mocked: PDF generation failed"}}
        response = ElicensingInvoiceService.create_pdf_response(error_payload)
        # Assert
        assert response.status_code == 400
        assert response["Content-Type"] == "application/json"

        # ✅ Properly consume the streaming response
        raw_bytes = b"".join(response.streaming_content)
        parsed = json.loads(raw_bytes.decode("utf-8"))
        assert parsed == {"errors": {"unexpected_error": "Mocked: PDF generation failed"}}

    def test_create_pdf_response_success(self):

        mock_pdf = (b"%PDF mock", "invoice_INV-001_20250601.pdf", 2048)

        response = ElicensingInvoiceService.create_pdf_response(mock_pdf)

        assert response.status_code == 200
        assert response['Content-Type'] == 'application/pdf'
        assert response["Content-Disposition"] == 'attachment; filename="invoice_INV-001_20250601.pdf"'
        assert response["Content-Length"] == '2048'

    def test_get_elicensing_invoice_for_dashboard_for_irc_user(
        self,
    ):
        self.test_data.fee.base_amount = Decimal("300.00")
        self.test_data.fee.save()
        # additional report for current year
        test_data_2 = ComplianceTestHelper.build_test_data(
            reporting_year=MOCK_REPORTING_YEAR,
            crv_status=ComplianceReportVersion.ComplianceStatus.OBLIGATION_NOT_MET,
            create_invoice_data=True,
        )
        test_data_2.compliance_obligation.fee_amount_dollars = Decimal("400.00")
        test_data_2.compliance_obligation.save()

        # additional report for different year - should not be included
        test_data_3 = ComplianceTestHelper.build_test_data(
            reporting_year=2023,
            crv_status=ComplianceReportVersion.ComplianceStatus.OBLIGATION_NOT_MET,
            create_invoice_data=True,
        )
        test_data_3.compliance_obligation.fee_amount_dollars = Decimal("450.00")
        test_data_3.compliance_obligation.save()

        cas_analyst = make_recipe("registration.tests.utils.cas_analyst")

        result = ElicensingInvoiceService.get_elicensing_invoice_for_dashboard(
            cas_analyst.user_guid, sort_field="id", sort_order="asc", filters=_NoopFilters()
        )
        assert (
            result.count() == ElicensingInvoice.objects.count()
        )  # cas users should see all invoices, 3 from setup (obligation + 2 penalty invoices) + 2 from this test

        assert list(result.values_list("invoice_type", flat=True)) == [
            "obligation",
            "automatic overdue penalty",
            "late submission penalty",
            "obligation",
            "obligation",
        ]
        # spot-checking the details
        assert result[0].invoice_type == "obligation"
        assert result[0].invoice_total == 300
        assert result[0].total_payments == 250  # 201 + 49
        assert result[0].total_adjustments == 50  # 25 + 25

    def test_get_elicensing_invoice_for_dashboard_for_industry_user(self):
        # invoice belonging to operator
        test_data_2 = ComplianceTestHelper.build_test_data(
            reporting_year=MOCK_REPORTING_YEAR,
            crv_status=ComplianceReportVersion.ComplianceStatus.OBLIGATION_NOT_MET,
            create_invoice_data=True,
        )
        test_data_2.fee.base_amount = Decimal("500.00")
        test_data_2.fee.save()

        approved_user_operator = make_recipe(
            'registration.tests.utils.approved_user_operator', operator=test_data_2.operation.operator
        )

        # Add payments and adjustments
        make_recipe("compliance.tests.utils.elicensing_payment", elicensing_line_item=test_data_2.fee, amount=201)
        make_recipe("compliance.tests.utils.elicensing_payment", elicensing_line_item=test_data_2.fee, amount=49)
        make_recipe("compliance.tests.utils.elicensing_adjustment", elicensing_line_item=test_data_2.fee, amount=25)
        make_recipe("compliance.tests.utils.elicensing_adjustment", elicensing_line_item=test_data_2.fee, amount=25)

        assert (
            ElicensingInvoice.objects.count() == 4
        )  # 3 from setup (obligation + 2 penalty invoices) + 1 from this test

        result = ElicensingInvoiceService.get_elicensing_invoice_for_dashboard(
            approved_user_operator.user.user_guid, sort_field="id", sort_order="asc", filters=_NoopFilters()
        )
        assert result.count() == 1

        assert result[0].invoice_type == "obligation"
        assert result[0].invoice_total == 500
        assert result[0].total_payments == 250  # 201 + 49
        assert result[0].total_adjustments == 50  # 25 + 25
