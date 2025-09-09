from unittest.mock import patch
import uuid
from common.models import EmailNotification
from registration.models.app_role import AppRole
from registration.models.user import User
from registration.models.user_operator import UserOperator
from service.email.email_service import EmailService
import pytest
from service.data_access_service.email_template_service import EmailNotificationTemplateService
from model_bakery import baker
from compliance.emails import (
    _send_email_to_operators_approved_users_or_raise,
    send_notice_of_earned_credits_generated_email,
    send_notice_of_no_obligation_no_credits_generated_email,
)

pytestmark = pytest.mark.django_db
email_service = EmailService()
SEND_EMAIL_TO_OPERATORS_USERS_PATH = 'compliance.emails._send_email_to_operators_approved_users_or_raise'


def mock_email_service(mocker):
    return mocker.patch.object(
        email_service,
        'send_email_by_template',
        return_value={'txId': str(uuid.uuid4()), 'messages': [{'msgId': str(uuid.uuid4())}]},
    )


class TestComplianceEmailHelpers:
    def test_send_email_to_operators_approved_users_or_raise_success(self, mocker):
        # admin user - should receive email
        approved_user_operator = baker.make_recipe(
            'registration.tests.utils.approved_user_operator',
        )
        # two reporter users with the same operator - should receive email
        users = baker.make(User, app_role=AppRole.objects.get(role_name="industry_user"), _quantity=2)
        baker.make_recipe(
            'registration.tests.utils.user_operator',
            user=users[0],
            operator=approved_user_operator.operator,
            status=UserOperator.Statuses.APPROVED,
        )
        baker.make_recipe(
            'registration.tests.utils.user_operator',
            user=users[1],
            operator=approved_user_operator.operator,
            status=UserOperator.Statuses.APPROVED,
        )

        # one declined user with the same operator - should NOT receive email
        declined_user = baker.make(User, app_role=AppRole.objects.get(role_name="industry_user"))
        baker.make_recipe(
            'registration.tests.utils.user_operator',
            user=declined_user,
            operator=approved_user_operator.operator,
            status=UserOperator.Statuses.DECLINED,
        )

        # some users from another operator - should not receive email
        other_operator_user_1 = baker.make_recipe(
            'registration.tests.utils.user_operator', status=UserOperator.Statuses.APPROVED
        )
        other_operator_user_2 = baker.make_recipe(
            'registration.tests.utils.user_operator', status=UserOperator.Statuses.APPROVED
        )

        template_instance = EmailNotificationTemplateService.get_template_by_name('Notice of Earned Credits Generated')
        mocked_send_email = mock_email_service(mocker)
        expected_context = {'context': 'context'}

        _send_email_to_operators_approved_users_or_raise(
            approved_user_operator.operator, template_instance, expected_context
        )

        # Assert that send_email_by_template is called once with all recipients
        expected_recipients = [
            approved_user_operator.user.email,
            users[0].email,
            users[1].email,
        ]

        # Assert that send_email_by_template is called exactly once
        mocked_send_email.assert_called_once_with(
            template_instance,
            expected_context,
            expected_recipients,
        )

        # Assert that only one email notification record is created
        assert EmailNotification.objects.filter(template=template_instance).count() == 1

        # Get the created email notification record
        email_notification = EmailNotification.objects.get(template=template_instance)

        # Assert the notification record has the correct recipients
        assert set(email_notification.recipients_email) == set(expected_recipients)

        # Assert the notification record has the correct template
        assert email_notification.template == template_instance

        # Assert that the notification record has transaction and message IDs
        assert email_notification.transaction_id is not None
        assert email_notification.message_id is not None

        # Assert that all expected recipients are included in the single email
        assert len(email_notification.recipients_email) == 3  # admin + 2 users

        # Assert specific recipients are present
        recipient_emails = email_notification.recipients_email
        assert approved_user_operator.user.email in recipient_emails
        assert users[0].email in recipient_emails
        assert users[1].email in recipient_emails

        # Assert that users from other operators do NOT receive emails
        assert other_operator_user_1.user.email not in recipient_emails
        assert other_operator_user_2.user.email not in recipient_emails

        # Assert that declined user does NOT receive email
        assert declined_user.email not in recipient_emails

    def test_send_email_to_operators_approved_users_or_raise_fail(self, mocker):
        # Arrange: create an approved user_operator
        approved_user_operator = baker.make_recipe(
            'registration.tests.utils.approved_user_operator',
        )

        template_instance = EmailNotificationTemplateService.get_template_by_name('Notice of Earned Credits Generated')
        mocked_send_email = mock_email_service(mocker)

        mocked_send_email.side_effect = Exception("Whoops")
        with pytest.raises(Exception, match="Whoops"):
            _send_email_to_operators_approved_users_or_raise(
                approved_user_operator.operator, template_instance, {"foo": "bar"}
            )


class TestSendNotifications:
    @patch(SEND_EMAIL_TO_OPERATORS_USERS_PATH)
    def test_send_earned_credits_email(self, mock_send_email_to_operators_approved_users_or_raise):
        # admin user
        approved_user_operator = baker.make_recipe(
            'registration.tests.utils.approved_user_operator',
        )

        # Create a report with earned credits
        report = baker.make_recipe('reporting.tests.utils.report', operator=approved_user_operator.operator)
        compliance_report = baker.make_recipe('compliance.tests.utils.compliance_report', report=report)
        compliance_report_version = baker.make_recipe(
            'compliance.tests.utils.compliance_report_version', compliance_report=compliance_report
        )
        earned_credit = baker.make_recipe(
            'compliance.tests.utils.compliance_earned_credit',
            compliance_report_version=compliance_report_version,
            earned_credits_amount=100,
        )

        template_instance = EmailNotificationTemplateService.get_template_by_name('Notice of Earned Credits Generated')
        expected_context = {
            "operator_legal_name": approved_user_operator.operator.legal_name,
            "operation_name": report.operation.name,
            "compliance_year": report.reporting_year.reporting_year,
            "earned_credit_amount": 100,
        }

        # Call the function with the earned credit ID
        send_notice_of_earned_credits_generated_email(earned_credit.id)
        mock_send_email_to_operators_approved_users_or_raise.assert_called_once_with(
            approved_user_operator.operator,
            template_instance,
            expected_context,
        )

    @patch(SEND_EMAIL_TO_OPERATORS_USERS_PATH)
    def test_send_no_obligation_no_credits_email(self, mock_send_email_to_operators_approved_users_or_raise):
        # admin user
        approved_user_operator = baker.make_recipe(
            'registration.tests.utils.approved_user_operator',
        )

        # Create a report with no obligation or earned credits
        report = baker.make_recipe('reporting.tests.utils.report', operator=approved_user_operator.operator)

        template_instance = EmailNotificationTemplateService.get_template_by_name(
            'No Obligation No Earned Credits Generated'
        )

        expected_context = {
            "operator_legal_name": report.operator.legal_name,
            "operation_name": report.operation.name,
            "compliance_year": report.reporting_year.reporting_year,
        }

        # Call the function with the report
        send_notice_of_no_obligation_no_credits_generated_email(report)
        mock_send_email_to_operators_approved_users_or_raise.assert_called_once_with(
            approved_user_operator.operator,
            template_instance,
            expected_context,
        )
