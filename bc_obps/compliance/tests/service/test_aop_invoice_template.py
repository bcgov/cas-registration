from django.template.loader import render_to_string
from django.test import SimpleTestCase
from compliance.dataclass import AutomaticOverduePenaltyInvoiceContext


class TestAOPInvoiceTemplate(SimpleTestCase):
    def setUp(self):
        self.base_context = AutomaticOverduePenaltyInvoiceContext(
            invoice_number="INV-2025-001",
            invoice_date="Jan 15, 2025",
            invoice_due_date="Feb 15, 2025",
            invoice_printed_date="Jan 15, 2025",
            invoice_is_void=False,
            operator_name="Test Operator Ltd.",
            operator_address_line1="123 Test Street",
            operator_address_line2="Vancouver, BC V6B 1A1",
            operation_name="Test Operation",
            compliance_obligation_id="25-0001-1",
            billing_items=[{"date": "Jan 15, 2025", "description": "Automatic Overdue Penalty", "amount": "$2,000.00"}],
            total_amount_due="$2,000.00",
            logo_base64="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
            penalty_amount="$2,000.00",
        )

    def test_invoice_template_renders_with_all_required_variables(self):
        context = self.base_context.__dict__
        rendered_html = render_to_string('automatic_overdue_penalty_invoice.html', context)
        self.assertIn("<!doctype html>", rendered_html)
        self.assertIn("<title>Compliance Invoice</title>", rendered_html)
        self.assertIn("Ministry of Energy and Climate Solutions", rendered_html)
        self.assertIn("Invoice", rendered_html)

    def test_invoice_template_includes_all_operator_information(self):
        context = self.base_context.__dict__
        rendered_html = render_to_string('automatic_overdue_penalty_invoice.html', context)
        self.assertIn("Operator Business Address", rendered_html)
        self.assertIn("Test Operator Ltd.", rendered_html)
        self.assertIn("123 Test Street", rendered_html)
        self.assertIn("Vancouver, BC V6B 1A1", rendered_html)
        self.assertIn("Test Operation", rendered_html)

    def test_invoice_template_includes_all_invoice_details(self):
        context = self.base_context.__dict__
        rendered_html = render_to_string('automatic_overdue_penalty_invoice.html', context)
        self.assertIn("INV-2025-001", rendered_html)
        self.assertIn("Jan 15, 2025", rendered_html)
        self.assertIn("Feb 15, 2025", rendered_html)
        self.assertIn("25-0001-1", rendered_html)
        self.assertIn("Obligation ID", rendered_html)
        self.assertIn("Penalty Amount", rendered_html)

    def test_invoice_template_includes_billing_items(self):
        context = self.base_context.__dict__
        rendered_html = render_to_string('automatic_overdue_penalty_invoice.html', context)
        self.assertIn("Fees and Adjustments", rendered_html)
        self.assertIn("Date", rendered_html)
        self.assertIn("Description", rendered_html)
        self.assertIn("Amount", rendered_html)
        self.assertIn("Automatic Overdue Penalty", rendered_html)
        self.assertIn("$2,000.00", rendered_html)
        self.assertIn("Amount Due:", rendered_html)

    def test_invoice_template_with_void_invoice(self):
        context = self.base_context.__dict__.copy()
        context['invoice_is_void'] = True
        rendered_html = render_to_string('automatic_overdue_penalty_invoice.html', context)
        self.assertIn("VOID", rendered_html)
        self.assertIn("watermark", rendered_html)

    def test_invoice_template_without_void_invoice(self):
        context = self.base_context.__dict__.copy()
        context['invoice_is_void'] = False
        rendered_html = render_to_string('automatic_overdue_penalty_invoice.html', context)
        self.assertNotIn("VOID", rendered_html)

    def test_invoice_template_with_multiple_billing_items(self):
        context = self.base_context.__dict__.copy()
        context['billing_items'] = [
            {"date": "Jan 15, 2025", "description": "Automatic Overdue Penalty", "amount": "$2,000.00"},
            {"date": "Jan 20, 2025", "description": "FAA Interest", "amount": "$100.00"},
            {"date": "Jan 25, 2025", "description": "Payment", "amount": "-$500.00"},
        ]
        context['total_amount_due'] = "$1,600.00"
        rendered_html = render_to_string('automatic_overdue_penalty_invoice.html', context)
        self.assertIn("Automatic Overdue Penalty", rendered_html)
        self.assertIn("FAA Interest", rendered_html)
        self.assertIn("Payment", rendered_html)
        self.assertIn("$2,000.00", rendered_html)
        self.assertIn("$100.00", rendered_html)
        self.assertIn("-$500.00", rendered_html)
        self.assertIn("$1,600.00", rendered_html)

    def test_invoice_template_with_empty_billing_items(self):
        context = self.base_context.__dict__.copy()
        context['billing_items'] = []
        context['total_amount_due'] = "$0.00"
        rendered_html = render_to_string('automatic_overdue_penalty_invoice.html', context)
        self.assertIn("<!doctype html>", rendered_html)
        self.assertIn("Fees and Adjustments", rendered_html)
        self.assertIn("Amount Due:", rendered_html)
        self.assertIn("$0.00", rendered_html)

    def test_invoice_template_includes_logo(self):
        context = self.base_context.__dict__
        rendered_html = render_to_string('automatic_overdue_penalty_invoice.html', context)
        self.assertIn("data:image/png;base64,", rendered_html)
        self.assertIn("CleanBC Logo", rendered_html)

    def test_invoice_template_css_styles_present(self):
        context = self.base_context.__dict__
        rendered_html = render_to_string('automatic_overdue_penalty_invoice.html', context)
        self.assertIn("font-family: \"Inter\"", rendered_html)
        self.assertIn("company-logo", rendered_html)
        self.assertIn("ministry-title", rendered_html)
        self.assertIn("invoice-title", rendered_html)
        self.assertIn("fees-container", rendered_html)
        self.assertIn("watermark", rendered_html)

    def test_invoice_template_page_setup(self):
        context = self.base_context.__dict__
        rendered_html = render_to_string('automatic_overdue_penalty_invoice.html', context)
        self.assertIn("@page", rendered_html)
        self.assertIn("size: A4 landscape", rendered_html)
        self.assertIn("@bottom-left", rendered_html)
        self.assertIn("@bottom-center", rendered_html)
        self.assertIn("@bottom-right", rendered_html)
        self.assertIn("Clean Growth Branch", rendered_html)

    def test_invoice_template_font_loading(self):
        context = self.base_context.__dict__
        rendered_html = render_to_string('automatic_overdue_penalty_invoice.html', context)
        self.assertIn("fonts.googleapis.com", rendered_html)
        self.assertIn("Inter", rendered_html)
