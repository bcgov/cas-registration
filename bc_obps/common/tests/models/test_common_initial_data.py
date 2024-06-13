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
        template = EmailNotificationTemplate.objects.get(name='New Operator And Admin Access Request Confirmation')
        self.assertEqual(
            template.subject,
            'BCIERS Receipt Acknowledgement – Addition of {{ operator_legal_name }} and administrator access request',
        )
        self.assertEqual(
            template.body,
            '''
            <p style="text-align: center;">Province of British Columbia</p>
            <p style="text-align: center;">B.C. Industrial Emissions Reporting System (BCIERS)</p><br>
            <p>Dear {{ external_user_full_name }},</p><br>
            <p>Your request to add {{ operator_legal_name }} and obtain administrator access to its profile in BCIERS has been received by the Climate Action Secretariat (CAS).</p>
            <p>CAS is reviewing your requests. Please allow 3-5 business days to process this request. Once a decision is made, you may expect a notification email.</p><br>
            <p>If you have any questions, please contact our support team at <a href="mailto:GHGRegulator@gov.bc.ca">GHGRegulator@gov.bc.ca.</a></p><br>
            <p>Sent to: {{ external_user_email_address }}</p>
            <p>On behalf of the Climate Action Secretariat</p>
        ''',
        )
        template = EmailNotificationTemplate.objects.get(name='New Operator And Admin Access Request Approved')
        self.assertEqual(
            template.subject,
            'BCIERS Approval Notification – Addition of {{ operator_legal_name }} and administrator access request',
        )
        self.assertEqual(
            template.body,
            '''
            <p style="text-align: center;">Province of British Columbia</p>
            <p style="text-align: center;">B.C. Industrial Emissions Reporting System (BCIERS)</p><br>
            <p>Dear {{ external_user_full_name }},</p><br>
            <p>Your request to add {{ operator_legal_name }} and obtain administrator access to its profile in BCIERS has been approved by Climate Action Secretariat.</p>
            <p>Please log back into <a href="https://registration.industrialemissions.gov.bc.ca">BCIERS</a> to perform additional tasks, such as starting an application for a BC OBPS Regulated Operation ID.</p><br>
            <p>If you have any questions, please contact our support team at <a href="mailto:GHGRegulator@gov.bc.ca">GHGRegulator@gov.bc.ca.</a></p><br>
            <p>Sent to: {{ external_user_email_address }}</p>
            <p>On behalf of the Climate Action Secretariat</p>
        ''',
        )
        template = EmailNotificationTemplate.objects.get(name='New Operator And Admin Access Request Declined')
        self.assertEqual(
            template.subject,
            'BCIERS Decline Notification – Addition of {{ operator_legal_name }} and administrator access request',
        )
        self.assertEqual(
            template.body,
            '''
            <p style="text-align: center;">Province of British Columbia</p>
            <p style="text-align: center;">B.C. Industrial Emissions Reporting System (BCIERS)</p><br>
            <p>Dear {{ external_user_full_name }},</p><br>
            <p>Your requests to add {{ operator_legal_name }} and obtain administrator access to its profile in BCIERS has been declined by the Climate Action Secretariat.</p><br>
            <p>If you have any questions, please contact our support team at <a href="mailto:GHGRegulator@gov.bc.ca">GHGRegulator@gov.bc.ca.</a></p><br>
            <p>Sent to: {{ external_user_email_address }}</p>
            <p>On behalf of the Climate Action Secretariat</p>
        ''',
        )

    def test_boro_id_application_templates(self):
        template = EmailNotificationTemplate.objects.get(name='BORO ID Application Confirmation')
        self.assertEqual(
            template.subject,
            'BCIERS Receipt Acknowledgement - BORO ID application for {{ operation_name }} of {{ operator_legal_name }}',
        )
        self.assertEqual(
            template.body,
            '''
            <p style="text-align: center;">Province of British Columbia</p>
            <p style="text-align: center;">B.C. Industrial Emissions Reporting System (BCIERS)</p><br>
            <p>Dear {{ external_user_full_name }},</p><br>
            <p>Your application to obtain a BC OBPS Regulated Operation ID (BORO ID) for {{ operation_name }} of {{ operator_legal_name }} has been received by the Climate Action Secretariat (CAS) through BCIERS.</p>
            <p>CAS is reviewing the application. Please allow 3-5 business days to process this request. Clarifications and changes may be requested as part of the reviewing process. Once a decision is made, you may expect a notification email.</p><br>
            <p>If you have any questions, please contact our support team at <a href="mailto:GHGRegulator@gov.bc.ca">GHGRegulator@gov.bc.ca.</a></p><br>
            <p>Sent to: {{ external_user_email_address }}</p>
            <p>On behalf of the Climate Action Secretariat</p>
        ''',
        )
        template = EmailNotificationTemplate.objects.get(name='BORO ID Application Approved')
        self.assertEqual(
            template.subject,
            'BCIERS Approval Notification – BORO ID application for {{ operation_name }} of {{ operator_legal_name }}',
        )
        self.assertEqual(
            template.body,
            '''
            <p style="text-align: center;">Province of British Columbia</p>
            <p style="text-align: center;">B.C. Industrial Emissions Reporting System (BCIERS)</p><br>
            <p>Dear {{ external_user_full_name }},</p><br>
            <p>Your application to obtain a BC OBPS Regulated Operation ID (BORO ID) for {{ operation_name }} of {{ operator_legal_name }} has been approved by the Climate Action Secretariat.</p>
            <p>Please log back into <a href="https://registration.industrialemissions.gov.bc.ca/">BCIERS</a> to see {{ operation_name }}’s assigned BORO ID. For more information on how to use the BORO ID, please refer to <a href="https://www2.gov.bc.ca/assets/gov/environment/climate-change/ind/obps/guidance/bc_obps_guidance.pdf">Getting Started with the B.C. Output-Based Pricing System (gov.bc.ca)</a>.</p><br>
            <p>If you have any questions, please contact our support team at <a href="mailto:GHGRegulator@gov.bc.ca">GHGRegulator@gov.bc.ca.</a></p><br>
            <p>Sent to: {{ external_user_email_address }}</p>
            <p>On behalf of the Climate Action Secretariat</p>
        ''',
        )

        template = EmailNotificationTemplate.objects.get(name='BORO ID Application Declined')
        self.assertEqual(
            template.subject,
            'BCIERS Decline Notification – BORO ID application for {{ operation_name }} of {{ operator_legal_name }}',
        )
        self.assertEqual(
            template.body,
            '''
            <p style="text-align: center;">Province of British Columbia</p>
            <p style="text-align: center;">B.C. Industrial Emissions Reporting System (BCIERS)</p><br>
            <p>Dear {{ external_user_full_name }},</p><br>
            <p>Your application to obtain a BC OBPS Regulated Operation ID (BORO ID) for {{ operation_name }} of {{ operator_legal_name }} has been declined by the Climate Action Secretariat.</p><br>
            <p>If you have any questions, please contact our support team at <a href="mailto:GHGRegulator@gov.bc.ca">GHGRegulator@gov.bc.ca.</a></p><br>
            <p>Sent to: {{ external_user_email_address }}</p>
            <p>On behalf of the Climate Action Secretariat</p>
        ''',
        )

        template = EmailNotificationTemplate.objects.get(name='BORO ID Application Changes Requested')
        self.assertEqual(
            template.subject,
            'BCIERS Changes Request – BORO ID application for {{ operation_name }} of {{ operator_legal_name }}',
        )
        self.assertEqual(
            template.body,
            '''
            <p style="text-align: center;">Province of British Columbia</p>
            <p style="text-align: center;">B.C. Industrial Emissions Reporting System (BCIERS)</p><br>
            <p>Dear {{ external_user_full_name }},</p><br>
            <p>Changes are requested to your application to obtain a BC OBPS Regulated Operation ID (BORO ID) for {{ operation_name }} of {{ operator_legal_name }}.</p>
            <p>A staff member of the Climate Action Secretariat has sent, or will send shortly, an email explaining the details of the changes requested. Please revise and resubmit your application accordingly.</p><br>
            <p>If you have any questions, please contact our support team at <a href="mailto:GHGRegulator@gov.bc.ca">GHGRegulator@gov.bc.ca.</a></p><br>
            <p>Sent to: {{ external_user_email_address }}</p>
            <p>On behalf of the Climate Action Secretariat</p>
        ''',
        )

    def test_opt_in_and_submit_operation_boro_id_email_notification_templates(self):
        template = EmailNotificationTemplate.objects.get(name='Opt-in And BORO ID Application Confirmation')
        self.assertEqual(
            template.subject,
            'BCIERS Receipt Acknowledgement - Opt-in and BORO ID application for {{ operation_name }} of {{ operator_legal_name }}',
        )
        self.assertEqual(
            template.body,
            '''
            <p style="text-align: center;">Province of British Columbia</p>
            <p style="text-align: center;">B.C. Industrial Emissions Reporting System (BCIERS)</p><br>
            <p>Dear {{ external_user_full_name }},</p><br>
            <p>Part of your application to opt-in as a reporting and regulated operation and obtain a BC OBPS Regulated Operation ID (BORO ID) for {{ operation_name }} of {{ operator_legal_name }} has been received by the Climate Action Secretariat (CAS) through BCIERS.</p>
            <p>A complete application requires additional documents to be sent to <a href="mailto:GHGRegulator@gov.bc.ca">GHGRegulator@gov.bc.ca.</a> according to <a href="https://www2.gov.bc.ca/gov/content/environment/climate-change/industry/bc-output-based-pricing-system#opting-in">B.C. Output-Based Pricing System - Province of British Columbia (gov.bc.ca)</a>.</p><br>
            <p>CAS will only review a complete application. Once a complete application has been received, please allow 3-5 business days to process this request. Clarifications and changes may be requested as part of the reviewing process. Once a decision is made, you may expect a notification email.</p><br>
            <p>If you have any questions, please contact our support team at <a href="mailto:GHGRegulator@gov.bc.ca">GHGRegulator@gov.bc.ca.</a></p><br>
            <p>Sent to: {{ external_user_email_address }}</p>
            <p>On behalf of the Climate Action Secretariat</p>
        ''',
        )
        template = EmailNotificationTemplate.objects.get(name='Opt-in And BORO ID Application Approved')
        self.assertEqual(
            template.subject,
            'BCIERS Approval Notification – Opt-in and BORO ID application for {{ operation_name }} of {{ operator_legal_name }}',
        )
        self.assertEqual(
            template.body,
            '''
            <p style="text-align: center;">Province of British Columbia</p>
            <p style="text-align: center;">B.C. Industrial Emissions Reporting System (BCIERS)</p><br>
            <p>Dear {{ external_user_full_name }},</p><br>
            <p>Your application to opt-in as a reporting and regulated operation and obtain a BC OBPS Regulated Operation ID (BORO ID) for {{ operation_name }} of {{ operator_legal_name }} has been approved by the Climate Action Secretariat.</p>
            <p>Please log back into <a href="https://registration.industrialemissions.gov.bc.ca/">BCIERS</a> to see {{ operation_name }}’s assigned BORO ID. For more information on how to use the BORO ID, please refer to <a href="https://www2.gov.bc.ca/assets/gov/environment/climate-change/ind/obps/guidance/bc_obps_guidance.pdf">Getting Started with the B.C. Output-Based Pricing System (gov.bc.ca)</a>.</p><br>
            <p>If you have any questions, please contact our support team at <a href="mailto:GHGRegulator@gov.bc.ca">GHGRegulator@gov.bc.ca.</a></p><br>
            <p>Sent to: {{ external_user_email_address }}</p>
            <p>On behalf of the Climate Action Secretariat</p>
        ''',
        )
        template = EmailNotificationTemplate.objects.get(name='Opt-in And BORO ID Application Declined')
        self.assertEqual(
            template.subject,
            'BCIERS Decline Notification – Opt-in and BORO ID application for {{ operation_name }} of {{ operator_legal_name }}',
        )
        self.assertEqual(
            template.body,
            '''
            <p style="text-align: center;">Province of British Columbia</p>
            <p style="text-align: center;">B.C. Industrial Emissions Reporting System (BCIERS)</p><br>
            <p>Dear {{ external_user_full_name }},</p><br>
            <p>Your application to opt-in as a reporting and regulated operation and obtain a BC OBPS Regulated Operation ID (BORO ID) for {{ operation_name }} of {{ operator_legal_name }} has been declined by the Climate Action Secretariat.</p><br>
            <p>If you have any questions, please contact our support team at <a href="mailto:GHGRegulator@gov.bc.ca">GHGRegulator@gov.bc.ca.</a></p><br>
            <p>Sent to: {{ external_user_email_address }}</p>
            <p>On behalf of the Climate Action Secretariat</p>
        ''',
        )
        template = EmailNotificationTemplate.objects.get(name='Opt-in And BORO ID Application Changes Requested')
        self.assertEqual(
            template.subject,
            'BCIERS Changes Request – Opt-in and BORO ID application for {{ operation_name }} of {{ operator_legal_name }}',
        )
        self.assertEqual(
            template.body,
            '''
            <p style="text-align: center;">Province of British Columbia</p>
            <p style="text-align: center;">B.C. Industrial Emissions Reporting System (BCIERS)</p><br>
            <p>Dear {{ external_user_full_name }},</p><br>
            <p>Changes are requested to your application to opt-in as a reporting and regulated operation and obtain a BC OBPS Regulated Operation ID (BORO ID) for {{ operation_name }} of {{ operator_legal_name }}.</p>
            <p>A staff member of the Climate Action Secretariat has sent, or will send shortly, an email explaining the details of the changes requested. Please revise and resubmit your application accordingly.</p><br>
            <p>If you have any questions, please contact our support team at <a href="mailto:GHGRegulator@gov.bc.ca">GHGRegulator@gov.bc.ca.</a></p><br>
            <p>Sent to: {{ external_user_email_address }}</p>
            <p>On behalf of the Climate Action Secretariat</p>
        ''',
        )
