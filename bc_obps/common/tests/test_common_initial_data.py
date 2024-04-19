from common.models import EmailNotificationTemplate
from django.test import TestCase


class TestInitialData(TestCase):
    def test_admin_access_request_email_notification_templates(self):
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
        template = EmailNotificationTemplate.objects.get(name='Admin Access Request Approved')
        self.assertEqual(
            template.subject,
            'BCIERS Approval Notification – Administrator access request to {{ operator_legal_name }}',
        )
        self.assertEqual(
            template.body,
            '''
            <p style="text-align: center;">Province of British Columbia</p>
            <p style="text-align: center;">B.C. Industrial Emissions Reporting System (BCIERS)</p><br>
            <p>Dear {{ external_user_full_name }},</p><br>
            <p>Your administrator access request to {{ operator_legal_name }} in BCIERS has been approved by the Climate Action Secretariat.</p>
            <p>Please log back into <a href="https://registration.industrialemissions.gov.bc.ca">BCIERS</a> to perform additional tasks, such as starting an application for a BC OBPS Regulated Operation ID.</p><br>
            <p>If you have any questions, please contact our support team at <a href="mailto:GHGRegulator@gov.bc.ca">GHGRegulator@gov.bc.ca.</a></p><br>
            <p>Sent to: {{ external_user_email_address }}</p>
            <p>On behalf of the Climate Action Secretariat</p>
        ''',
        )
        template = EmailNotificationTemplate.objects.get(name='Admin Access Request Declined')
        self.assertEqual(
            template.subject,
            'BCIERS Decline Notification – Administrator access request to {{ operator_legal_name }}',
        )
        self.assertEqual(
            template.body,
            '''
            <p style="text-align: center;">Province of British Columbia</p>
            <p style="text-align: center;">B.C. Industrial Emissions Reporting System (BCIERS)</p><br>
            <p>Dear {{ external_user_full_name }},</p><br>
            <p>Your administrator access request to {{ operator_legal_name }} in BCIERS has been declined by the Climate Action Secretariat.</p><br>
            <p>If you have any questions, please contact our support team at <a href="mailto:GHGRegulator@gov.bc.ca">GHGRegulator@gov.bc.ca.</a></p><br>
            <p>Sent to: {{ external_user_email_address }}</p>
            <p>On behalf of the Climate Action Secretariat</p>
        ''',
        )

        template = EmailNotificationTemplate.objects.get(name='Operator With Admin Access Request Confirmation')
        self.assertEqual(
            template.subject,
            'BCIERS Receipt Acknowledgement – Access request to {{ operator_legal_name }}',
        )
        self.assertEqual(
            template.body,
            '''
            <p style="text-align: center;">Province of British Columbia</p>
            <p style="text-align: center;">B.C. Industrial Emissions Reporting System (BCIERS)</p><br>
            <p>Dear {{ external_user_full_name }},</p><br>
            <p>Your access request to {{ operator_legal_name }} in BCIERS has been received.</p>
            <p>An operation representative with administrator access to {{ operator_legal_name }} should review your request. Once a decision is made, you may expect a notification email.</p><br>
            <p>If you have any questions, please contact our support team at <a href="mailto:GHGRegulator@gov.bc.ca">GHGRegulator@gov.bc.ca.</a></p><br>
            <p>Sent to: {{ external_user_email_address }}</p>
            <p>On behalf of the Climate Action Secretariat</p>
        ''',
        )
        template = EmailNotificationTemplate.objects.get(name='Operator With Admin Access Request Approved')
        self.assertEqual(
            template.subject,
            'BCIERS Approval Notification – Access request to {{ operator_legal_name }}',
        )
        self.assertEqual(
            template.body,
            '''
            <p style="text-align: center;">Province of British Columbia</p>
            <p style="text-align: center;">B.C. Industrial Emissions Reporting System (BCIERS)</p><br>
            <p>Dear {{ external_user_full_name }},</p><br>
            <p>Your access request to {{ operator_legal_name }} in BCIERS has been approved by an operation representative with administrator access to {{ operator_legal_name }}.</p>
            <p>Please log back into <a href="https://registration.industrialemissions.gov.bc.ca">BCIERS</a> to perform additional tasks, such as starting an application for a BC OBPS Regulated Operation ID.</p><br>
            <p>If you have any questions, please contact our support team at <a href="mailto:GHGRegulator@gov.bc.ca">GHGRegulator@gov.bc.ca.</a></p><br>
            <p>Sent to: {{ external_user_email_address }}</p>
            <p>On behalf of the Climate Action Secretariat</p>
        ''',
        )
        template = EmailNotificationTemplate.objects.get(name='Operator With Admin Access Request Declined')
        self.assertEqual(
            template.subject,
            'BCIERS Decline Notification – Access request to {{ operator_legal_name }}',
        )
        self.assertEqual(
            template.body,
            '''
            <p style="text-align: center;">Province of British Columbia</p>
            <p style="text-align: center;">B.C. Industrial Emissions Reporting System (BCIERS)</p><br>
            <p>Dear {{ external_user_full_name }},</p><br>
            <p>Your access request to {{ operator_legal_name }} in BCIERS has been declined by an operation representative with administrator access to {{ operator_legal_name }}.</p><br>
            <p>If you have any questions, please contact our support team at <a href="mailto:GHGRegulator@gov.bc.ca">GHGRegulator@gov.bc.ca.</a></p><br>
            <p>Sent to: {{ external_user_email_address }}</p>
            <p>On behalf of the Climate Action Secretariat</p>
        ''',
        )
