from django.template.loader import render_to_string
from django.test import SimpleTestCase


class TestPaymentInstructionsTemplate(SimpleTestCase):
    def setUp(self):
        self.base_context = {
            'invoice_number': "OBI690837",
            'is_penalty': False,
            'logo_base64': "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
        }

    def test_renders_with_all_required_variables(self):
        rendered_html = render_to_string('payment_instructions.html', self.base_context)
        self.assertIn("<!doctype html>", rendered_html)
        self.assertIn("<title>Compliance Payment Instructions</title>", rendered_html)
        self.assertIn("Payment Instructions", rendered_html)
        self.assertIn("Invoice #: OBI690837", rendered_html)

    def test_includes_payee_information(self):
        rendered_html = render_to_string('payment_instructions.html', self.base_context)
        self.assertIn("Canadian Imperial Bank of Commerce", rendered_html)
        self.assertIn("00090", rendered_html)
        self.assertIn("010", rendered_html)
        self.assertIn("CIBCCATT", rendered_html)
        self.assertIn("09-70301", rendered_html)
        self.assertIn("Province of British Columbia-OBPS-BCIERS", rendered_html)
        self.assertIn("1175 DOUGLAS STREET, VICTORIA, BC V8W2E1", rendered_html)

    def test_includes_before_making_a_payment_details(self):
        rendered_html = render_to_string('payment_instructions.html', self.base_context)
        self.assertIn("Before making a payment", rendered_html)
        self.assertIn("Operator Name", rendered_html)
        self.assertIn("Exact payment date", rendered_html)
        self.assertIn("Payment amount", rendered_html)
        self.assertIn("Invoice number", rendered_html)
        self.assertIn("Person(s) to contact regarding payments", rendered_html)

    def test_includes_five_business_days_note_when_not_penalty(self):
        context = {**self.base_context, 'is_penalty': False}
        rendered_html = render_to_string('payment_instructions.html', context)
        self.assertIn(
            "Plan to make your payment at least five business days before the",
            rendered_html,
        )
        self.assertIn("payment date determines compliance with the deadline", rendered_html)
        self.assertIn("Payment date is the date when payment is deposited into the", rendered_html)
        self.assertIn("B.C. OBPS bank account", rendered_html)

    def test_omits_five_business_days_note_when_penalty(self):
        context = {**self.base_context, 'is_penalty': True}
        rendered_html = render_to_string('payment_instructions.html', context)
        self.assertNotIn(
            "Plan to make your payment at least five business days before the",
            rendered_html,
        )

    def test_includes_requesting_additional_payment_information_section(self):
        rendered_html = render_to_string('payment_instructions.html', self.base_context)
        self.assertIn("Requesting additional payment information", rendered_html)
        self.assertIn("To request voice authorization, additional payment information, to", rendered_html)
        self.assertIn('mailto:OBPSPayments@gov.bc.ca', rendered_html)

    def test_includes_remarks(self):
        rendered_html = render_to_string('payment_instructions.html', self.base_context)
        self.assertIn(
            "Pay 5 business days in advance of the due date to allow for",
            rendered_html,
        )
        self.assertIn("processing to avoid", rendered_html)
        self.assertIn("penalties", rendered_html)
        self.assertIn("interests", rendered_html)
        self.assertIn("Do not include other charges with your payment for this invoice", rendered_html)
        self.assertIn("Do not mail cash", rendered_html)

    def test_includes_logo(self):
        rendered_html = render_to_string('payment_instructions.html', self.base_context)
        self.assertIn("data:image/png;base64,", rendered_html)
        self.assertIn("CleanBC Logo", rendered_html)
