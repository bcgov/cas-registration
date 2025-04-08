from common.models import EmailNotificationTemplate
from django.test import TestCase


class TestInitialData(TestCase):
    def test_admin_access_request_email_notification_templates(self):
        template = EmailNotificationTemplate.objects.get(name='Admin Access Request Confirmation')
        self.assertEqual(
            template.subject,
            'BCIERS Receipt Acknowledgement – Access Request to {{ operator_legal_name }}',
        )
        self.assertEqual(
            template.body,
            '''
            <p style="text-align: center;">Province of British Columbia</p>
            <p style="text-align: center;">B.C. Industrial Emissions Reporting System (BCIERS)</p><br>
            <p>Dear {{ external_user_full_name }},</p><br>
            <p>Your request to receive access to {{ operator_legal_name }} in BCIERS has been received by the Climate Action Secretariat (CAS).  </p>
            <p>CAS is reviewing your request and will contact you within 3 business days to provide a status update.</p><br>
            <p>If you have any questions, please contact our support team at <a href="mailto:GHGRegulator@gov.bc.ca">GHGRegulator@gov.bc.ca.</a></p><br>
            <p>Sent to: {{ external_user_email_address }}</p>
            <p>On behalf of the Climate Action Secretariat</p>
        ''',
        )
        template = EmailNotificationTemplate.objects.get(name='Admin Access Request Approved')
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
            <p>Your request to receive access to {{ operator_legal_name }} in BCIERS has been approved by the Climate Action Secretariat. You may now log back into <a href="https://registration.industrialemissions.gov.bc.ca">BCIERS</a> to register your operation(s). </p>
            <p>You have been granted administrator access for [Operator Legal Name]. This user role allows you to grant access and assign user roles to other individuals from your organization.</p><br>
            <p>If you have any questions, please contact our support team at <a href="mailto:GHGRegulator@gov.bc.ca">GHGRegulator@gov.bc.ca.</a></p><br>
            <p>Sent to: {{ external_user_email_address }}</p>
            <p>On behalf of the Climate Action Secretariat</p>
        ''',
        )
        template = EmailNotificationTemplate.objects.get(name='Admin Access Request Declined')
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
            <p>Your request to receive access to {{ operator_legal_name }} in BCIERS has been declined by the Climate Action Secretariat.
            </p><br>
            <p>f you have any questions, please contact our support team at <a href="mailto:GHGRegulator@gov.bc.ca">GHGRegulator@gov.bc.ca.</a></p><br>
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
            <p>Your request to receive access to {{ operator_legal_name }} in BCIERS has been submitted.</p>
            <p>An operation representative with administrator access to{{ operator_legal_name }} can now review and approve your request. You will receive a notification email once a decision is made. </p><br>
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
            <p>Your request to receive access to {{ operator_legal_name }} in BCIERS has been approved by an operation representative with administrator access to {{ operator_legal_name }}. You may now log-in to <a href="https://registration.industrialemissions.gov.bc.ca">BCIERS</a> and access {{ operator_legal_name }}.
            </p><br>
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
            <p>Your request to receive access to {{ operator_legal_name }} in BCIERS has been declined by an operation representative with administrator access to {{ operator_legal_name }}.
</p><br>
            <p>If you have any questions, please reach out to the individual that holds administrator access to {{ operator_legal_name }}.  </p><br>
            <p>Sent to: {{ external_user_email_address }}</p>
            <p>On behalf of the Climate Action Secretariat</p>
        ''',
        )

    def test_registration_submission_template(self):
        template = EmailNotificationTemplate.objects.get(name='Registration Submission Acknowledgement')
        self.assertEqual(
            template.subject,
            'BCIERS Receipt Acknowledgement – Registration Submitted for {{ operation_name }} of {{ operator_legal_name }}',
        )
        self.assertEqual(
            template.body,
            '''
            <p style="text-align: center;">Province of British Columbia</p>
            <p style="text-align: center;">B.C. Industrial Emissions Reporting System (BCIERS)</p><br>
            <p>Dear {{ external_user_full_name }},</p><br>
            <p>This email confirms that you have successfully submitted a registration for {{ operation_name }} of {{ operator_legal_name }} in BCIERS. You now have access to the Reporting Module in BCIERS where you can submit an annual report on behalf of {{ operation_name }}. A staff member from the Climate Action Secretariat will contact you if there are any questions about the registration information provided.
            </p><br>
            <p>If this operation is eligible to receive a B.C. OBPS Regulated Operation ID (BORO ID) and has not received one yet, Climate Action Secretariat staff will review the information provided and issue a BORO ID as applicable. You will receive an email notification if a BORO ID is issued to this operation. </p><br>
            <p>To return to BCIERS, click here: <a href="https://registration.industrialemissions.gov.bc.ca">registration.industrialemissions.gov.bc.ca/home</a></p><br>
            <p>If you have any questions, please contact our support team at <a href="mailto:GHGRegulator@gov.bc.ca">GHGRegulator@gov.bc.ca.</a></p><br>
            <p>Sent to: {{ external_user_email_address }}</p>
            <p>On behalf of the Climate Action Secretariat</p>
        ''',
        )

    def test_boro_id_issuance_template(self):
        template = EmailNotificationTemplate.objects.get(name='BORO ID Issuance')
        self.assertEqual(
            template.subject,
            'BCIERS Notification - BORO ID issued for {{ operation_name }} of {{ operator_legal_name }}',
        )
        self.assertEqual(
            template.body,
            '''
            <p style="text-align: center;">Province of British Columbia</p>
            <p style="text-align: center;">B.C. Industrial Emissions Reporting System (BCIERS)</p><br>
            <p>Dear {{ external_user_full_name }},</p><br>
            <p>{{ operation_name }} of {{ operator_legal_name }} has been issued a B.C. OBPS Regulated Operation ID (BORO ID) in BCIERS.</p>
            <p>Please log back into <a href="https://industrialemissions.gov.bc.ca">BCIERS</a> to see {{ operation_name }}'s assigned BORO ID. This BORO ID is required to complete a carbon tax exemption certificate, which is available on <a href="https://www2.gov.bc.ca/gov/content/taxes/sales-taxes/motor-fuel-carbon-tax/business/exemptions/obps-carbon-tax-exemption">this webpage</a>.</p><br>
            <p>If you have any questions, please contact our support team at <a href="mailto:GHGRegulator@gov.bc.ca">GHGRegulator@gov.bc.ca.</a></p><br>
            <p>Sent to: {{ external_user_email_address }}</p>
            <p>On behalf of the Climate Action Secretariat</p>
        ''',
        )
