import uuid
from common.models import EmailNotification
from registration.models.app_role import AppRole
from registration.models.user import User
from registration.models.user_operator import UserOperator
from service.email.email_service import EmailService
import pytest
from service.data_access_service.email_template_service import EmailNotificationTemplateService

from compliance.emails import send_earned_credit_notification_email

pytestmark = pytest.mark.django_db
email_service = EmailService()
from model_bakery import baker
from unittest.mock import call




class TestSendEarnedCreditsNotification:
    def mock_email_service(self, mocker):
        expected_email_notifications_after_sending = []

        def generate_return_value(*args, **kwargs):
            transaction_id = uuid.uuid4()
            message_id = uuid.uuid4()
            return {'txId': transaction_id, 'messages': [{'msgId': message_id}]}

        # Mock the send_email_by_template method to prevent sending real emails
        mocked_send_email_by_template = mocker.patch.object(
            email_service, 'send_email_by_template', side_effect=generate_return_value
        )

        return mocked_send_email_by_template


    def test_send_earned_credits_email(self, mocker):
        # Setup
        # admin user - should receive email
        approved_user_operator =  baker.make_recipe(
            'registration.tests.utils.approved_user_operator',
        )
        # two reporter users with the same operator - should receive email
        users = baker.make(User, app_role=AppRole.objects.get(role_name="industry_user"), _quantity=2)
        baker.make_recipe('registration.tests.utils.user_operator', user=users[0],operator=approved_user_operator.operator, status=UserOperator.Statuses.APPROVED)
        baker.make_recipe('registration.tests.utils.user_operator', user=users[1],operator=approved_user_operator.operator,status=UserOperator.Statuses.APPROVED)

        # some users from another operator - should not receive email
        baker.make_recipe(
            'registration.tests.utils.user_operator',status=UserOperator.Statuses.APPROVED
        )
        baker.make_recipe(
            'registration.tests.utils.user_operator',status=UserOperator.Statuses.APPROVED
        )

        # report 1 has earned credits - should trigger email
        report_1 = baker.make_recipe(
            'reporting.tests.utils.report', operator=approved_user_operator.operator)
        compliance_report_1 = baker.make_recipe(
            'compliance.tests.utils.compliance_report', report=report_1
        )
        compliance_report_version_1 = baker.make_recipe(
            'compliance.tests.utils.compliance_report_version',
            compliance_report=compliance_report_1
        )
        earned_credit = baker.make_recipe(
            'compliance.tests.utils.compliance_earned_credit',
            compliance_report_version=compliance_report_version_1,
            earned_credits_amount=100,
        )

        # report 2 has earned credits - should trigger email
        report_2 = baker.make_recipe(
            'reporting.tests.utils.report', operator=approved_user_operator.operator)
        compliance_report_2 = baker.make_recipe(
            'compliance.tests.utils.compliance_report', report=report_2
        )
        compliance_report_version_2 = baker.make_recipe(
            'compliance.tests.utils.compliance_report_version',
            compliance_report=compliance_report_2
        )
        earned_credit = baker.make_recipe(
            'compliance.tests.utils.compliance_earned_credit',
            compliance_report_version=compliance_report_version_2,
            earned_credits_amount=200,
        )

        # report 3 does not have credits - should not trigger email
        report_3 = baker.make_recipe(
            'reporting.tests.utils.report', operator=approved_user_operator.operator)
        compliance_report_3 = baker.make_recipe(
            'compliance.tests.utils.compliance_report', report=report_3
        )
        compliance_report_version_3 = baker.make_recipe(
            'compliance.tests.utils.compliance_report_version',
            compliance_report=compliance_report_3
        )

        # Setup ends
        
        template_instance = EmailNotificationTemplateService.get_template_by_name('Notice of Earned Credits Generated')
        
        mocked_send_email_by_template = self.mock_email_service(mocker)

        send_earned_credit_notification_email()

        # Assert that send_email_by_template is called multiple times with the correct data and recipients
        expected_calls = [
            call(
                template_instance,
                {
                    "operator_legal_name": approved_user_operator.operator.legal_name,
                    "operation_name": report_1.operation.name,
                    "compliance_year": report_1.reporting_year.reporting_year,
                    "earned_credit_amount": 100,
                    "email_address": approved_user_operator.user.email,
                },
                [approved_user_operator.user.email]
            ),
            call(
                template_instance,
                {
                    "operator_legal_name": approved_user_operator.operator.legal_name,
                    "operation_name": report_1.operation.name,
                    "compliance_year": report_1.reporting_year.reporting_year,
                    "earned_credit_amount": 100,
                    "email_address": users[0].email,
                },
                [users[0].email,]
            ),
            call(
                template_instance,
                {
                    "operator_legal_name": approved_user_operator.operator.legal_name,
                    "operation_name": report_1.operation.name,
                    "compliance_year": report_1.reporting_year.reporting_year,
                    "earned_credit_amount": 100,
                    "email_address": users[1].email,
                },
                [users[1].email,]
            ),
            call(
                template_instance,
                {
                    "operator_legal_name": approved_user_operator.operator.legal_name,
                    "operation_name": report_2.operation.name,
                    "compliance_year": report_2.reporting_year.reporting_year,
                    "earned_credit_amount": 200,
                    "email_address": approved_user_operator.user.email,
                },
                [approved_user_operator.user.email]
            ),
            call(
                template_instance,
                {
                    "operator_legal_name": approved_user_operator.operator.legal_name,
                    "operation_name": report_2.operation.name,
                    "compliance_year": report_2.reporting_year.reporting_year,
                    "earned_credit_amount": 200,
                    "email_address": users[0].email,
                },
                [users[0].email,]
            ),
            call(
                template_instance,
                {
                    "operator_legal_name": approved_user_operator.operator.legal_name,
                    "operation_name": report_2.operation.name,
                    "compliance_year": report_2.reporting_year.reporting_year,
                    "earned_credit_amount": 200,
                    "email_address": users[1].email,
                },
                [users[1].email,]
            ),
        ]

        mocked_send_email_by_template.assert_has_calls(expected_calls, any_order=False)
   
        assert EmailNotification.objects.filter(template=template_instance).count() == 6
        assert list(EmailNotification.objects.values_list('recipients_email')) == [
    ([approved_user_operator.user.email],),
    ([users[0].email],),
    ([users[1].email],),
    ([approved_user_operator.user.email],),
    ([users[0].email],),
    ([users[1].email],),
]
