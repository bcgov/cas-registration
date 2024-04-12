from common.models import EmailNotificationTemplate
from django.test import TestCase


class TestInitialData(TestCase):
    def test_email_notification_template_data(self):
        template = EmailNotificationTemplate.objects.get(name='Admin Access Request Confirmation')
        self.assertEqual(
            template.subject,
            'BCIERS Receipt Acknowledgement – Administrator access request to {{ operator_legal_name }}',
        )
        self.assertEqual(
            template.body,
            '''
            <p style="text-align: center;">Province of British Columbia</p>
            <p style="text-align: center;">B.C. Industrial Emissions Reporting System (BCIERS)</p><br>
            <p>Dear {{ external_user_full_name }},</p><br>
            <p>Your administrator access request to {{ operator_legal_name }} in BCIERS has been received by the Climate Action Secretariat (CAS).</p>
            <p>CAS is reviewing your request. Please allow 3-5 business days to process this request. Once a decision is made, you may expect a notification email.</p><br>
            <p>If you have any questions, please contact our support team at <a href="mailto:GHGRegulator@gov.bc.ca">GHGRegulator@gov.bc.ca.</a></p><br>
            <p>Sent to: {{ external_user_email_address }}</p>
            <p>On behalf of the Climate Action Secretariat</p>
        ''',
        )
