import uuid
from common.models import EmailNotification
from service.email.email_service import EmailService
from registration.emails import send_registration_and_boro_id_email, send_operator_access_request_email
from registration.enums.enums import AccessRequestStates, AccessRequestTypes, EmailTemplateNames
import pytest
from registration.models import Operation, User
from registration.tests.utils.bakers import operation_baker, user_baker
from service.data_access_service.email_template_service import EmailNotificationTemplateService

pytestmark = pytest.mark.django_db
email_service = EmailService()

# Sample data
operator_legal_name = "Test Operator"
external_user_full_name = "John Doe"
external_user_email_address = "send_operator_access_request_email@email.test"


class TestSendOperatorAccessRequestEmail:
    def mock_email_service(self, mocker):
        expected_email_notifications_after_sending = []

        expected_context = {
            "operator_legal_name": operator_legal_name,
            "external_user_full_name": external_user_full_name,
            "external_user_email_address": external_user_email_address,
        }

        def generate_return_value(*args, **kwargs):
            transaction_id = uuid.uuid4()
            message_id = uuid.uuid4()
            expected_email_notifications_after_sending.append(
                {
                    'txId': transaction_id,
                    'messages': [{'msgId': message_id}],
                    'template': args[0].id,
                    'recipients': args[2][0],
                }
            )
            return {'txId': transaction_id, 'messages': [{'msgId': message_id}]}

        # Mock the send_email_by_template method to prevent sending real emails
        mocked_send_email_by_template = mocker.patch.object(
            email_service, 'send_email_by_template', side_effect=generate_return_value
        )

        return mocked_send_email_by_template, expected_email_notifications_after_sending, expected_context

    @pytest.mark.parametrize("access_type", list(AccessRequestTypes))
    @pytest.mark.parametrize("access_state", list(AccessRequestStates))
    def test_send_operator_access_request_email(self, access_type, access_state, mocker):
        template_name = f"{access_type.value} Access Request {access_state.value}"
        template_instance = EmailNotificationTemplateService.get_template_by_name(template_name)
        (
            mocked_send_email_by_template,
            expected_email_notifications_after_sending,
            expected_context,
        ) = self.mock_email_service(mocker)

        # Make sure we don't have an email notification for the user before they request admin access
        assert not EmailNotification.objects.filter(
            template=template_instance,
            recipients_email=[external_user_email_address],
        ).exists()

        send_operator_access_request_email(
            access_state, access_type, operator_legal_name, external_user_full_name, external_user_email_address
        )

        # Assert that send_email_by_template is called with the correct data
        mocked_send_email_by_template.assert_called_with(
            template_instance, expected_context, [external_user_email_address]
        )

        # Assert that an email notification records were created
        for expected_email_notification in expected_email_notifications_after_sending:
            assert EmailNotification.objects.filter(
                transaction_id=expected_email_notification['txId'],
                message_id=expected_email_notification['messages'][0]['msgId'],
                template=expected_email_notification['template'],
                recipients_email=[expected_email_notification['recipients']],
            ).exists()


class TestSendBoroIdApplicationEmail:
    def setup_method(self, *args, **kwargs):
        self.operation: Operation = operation_baker()
        user: User = user_baker()
        self.operation.created_by = user
        self.operation.save()

    def mock_email_service(self, mocker):
        expected_email_notifications_after_sending = []

        def generate_return_value(*args, **kwargs):
            transaction_id = uuid.uuid4()
            message_id = uuid.uuid4()
            expected_email_notifications_after_sending.append(
                {
                    'txId': transaction_id,
                    'messages': [{'msgId': message_id}],
                    'template': args[0].id,
                    'recipients': args[2][0],
                }
            )
            return {'txId': transaction_id, 'messages': [{'msgId': message_id}]}

        mocked_send_email_by_template = mocker.patch.object(
            email_service, 'send_email_by_template', side_effect=generate_return_value
        )
        return mocked_send_email_by_template, expected_email_notifications_after_sending

    @pytest.mark.parametrize("template_name", list(EmailTemplateNames))
    def test_send_registration_and_boro_id_email_with_the_same_recipients(self, template_name, mocker):
        assert EmailNotification.objects.count() == 0
        template_instance = EmailNotificationTemplateService.get_template_by_name(template_name.value)
        mocked_send_email_by_template, expected_email_notifications_after_sending = self.mock_email_service(mocker)

        self.operation.created_by = user_baker({'email': 'email@email.com'})
        self.operation.save()

        send_registration_and_boro_id_email(
            template_name.value,
            self.operation.operator.legal_name,
            self.operation,
            registration_creator=self.operation.created_by,
        )

        assert mocked_send_email_by_template.call_count == 1
        mocked_send_email_by_template.assert_called_with(
            template_instance,
            {
                "operator_legal_name": self.operation.operator.legal_name,
                "operation_name": self.operation.name,
                "external_user_full_name": self.operation.created_by.get_full_name(),
                "external_user_email_address": self.operation.created_by.email,
            },
            [self.operation.created_by.email],
        )
        mocked_send_email_by_template.reset_mock()

        # Assert that the email notifications were created
        for expected_email_notification in expected_email_notifications_after_sending:
            assert EmailNotification.objects.filter(
                transaction_id=expected_email_notification['txId'],
                message_id=expected_email_notification['messages'][0]['msgId'],
                template=expected_email_notification['template'],
                recipients_email=[expected_email_notification['recipients']],
            ).exists()
