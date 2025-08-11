import pytest
from datetime import datetime
from decimal import Decimal
from unittest.mock import patch
from model_bakery.baker import make_recipe

from compliance.service.compliance_invoice_service import ComplianceInvoiceService
from compliance.models import ComplianceChargeRate
from compliance.models import ElicensingInvoice, ElicensingLineItem


pytestmark = pytest.mark.django_db


class TestComplianceInvoiceService:
    def setup_method(self):

        self.compliance_report_version = make_recipe(
            "compliance.tests.utils.compliance_report_version",
            report_compliance_summary__report_version__report_operation__operation_name="test",
        )

        self.obligation = make_recipe(
            "compliance.tests.utils.compliance_obligation",
            compliance_report_version=self.compliance_report_version,
            fee_amount_dollars=Decimal("300.00"),
            fee_date=datetime(2025, 6, 1),
            obligation_id="25-0001-1",
        )

        self.address = make_recipe("registration.tests.utils.address")
        self.operator = make_recipe("registration.tests.utils.operator", physical_address=self.address)
        self.operation = make_recipe("registration.tests.utils.operation", operator=self.operator)

        # Set up invoice and line items
        self.invoice = make_recipe(
            "compliance.tests.utils.elicensing_invoice",
            due_date=datetime(2025, 7, 1),
        )
        self.line_item = make_recipe(
            "compliance.tests.utils.elicensing_line_item",
            elicensing_invoice=self.invoice,
            fee_date=datetime(2025, 6, 1),
            base_amount=Decimal("300.00"),
            description="Compliance Fee",
        )
        # Add payment and adjustment
        make_recipe("compliance.tests.utils.elicensing_payment", elicensing_line_item=self.line_item)
        make_recipe("compliance.tests.utils.elicensing_adjustment", elicensing_line_item=self.line_item)

    @patch("compliance.service.compliance_invoice_service.PDFGeneratorService.generate_pdf")
    @patch(
        "compliance.service.compliance_invoice_service.ComplianceReportVersionService.get_operation_by_compliance_report_version"
    )
    @patch(
        "compliance.service.compliance_invoice_service.ComplianceReportVersionService.get_obligation_by_compliance_report_version"
    )
    @patch("compliance.service.compliance_invoice_service.ComplianceChargeRate.objects.get")
    @patch(
        "compliance.service.compliance_invoice_service.ElicensingDataRefreshService.refresh_data_wrapper_by_compliance_report_version_id"
    )
    def test_generate_invoice_pdf_success(
        self,
        mock_refresh_data,
        mock_get_charge_rate,
        mock_get_obligation,
        mock_get_operation,
        mock_generate_pdf,
    ):
        # Patch fresh data response
        mock_refresh_data.return_value.invoice = self.invoice
        mock_refresh_data.return_value.data_is_fresh = True

        # Charge rate for billing
        mock_get_charge_rate.return_value = ComplianceChargeRate(rate=Decimal("2.00"))

        # Patch other services
        mock_get_obligation.return_value = self.obligation
        mock_get_operation.return_value = self.operation
        mock_generate_pdf.return_value = (b"%PDF mock", "invoice_INV-001_20250601.pdf", 2048)

        result = ComplianceInvoiceService.generate_invoice_pdf(self.compliance_report_version.id)

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
                [{"amount": Decimal("100.00"), "date": datetime(2025, 6, 10).date(), "description": "Partial Payment"}],
                [],
                Decimal("200.00"),
                2,
            ),
            (
                Decimal("300.00"),
                [],
                [{"amount": Decimal("-50.00"), "date": datetime(2025, 6, 12).date(), "description": "Rebate"}],
                Decimal("250.00"),
                2,
            ),
            (
                Decimal("300.00"),
                [{"amount": Decimal("100.00"), "date": datetime(2025, 6, 10).date(), "description": "Partial Payment"}],
                [{"amount": Decimal("-25.00"), "date": datetime(2025, 6, 12).date(), "description": "Rebate"}],
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
                fee_date=datetime(2025, 6, 1).date(),
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
                    reason=a["description"],
                    type="CREDIT",
                )

        # Act
        amount_due, billing_items = ComplianceInvoiceService.calculate_invoice_amount_due(invoice)

        # Assert
        assert amount_due == expected_due
        assert len(billing_items) == expected_billing_count
