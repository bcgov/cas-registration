import uuid
from common.models import EmailNotification
from common.service.email.email_service import EmailService
from registration.emails import Recipient, send_boro_id_application_email, send_operator_access_request_email
from registration.enums.enums import AccessRequestStates, AccessRequestTypes, BoroIdApplicationStates
import pytest
from service.data_access_service.email_template_service import EmailNotificationTemplateService

pytestmark = pytest.mark.django_db
email_service = EmailService()


def test_send_operator_access_request_email(mocker):
    # Mock the send_email_by_template method to prevent sending real emails
    mocked_send_email_by_template = mocker.patch.object(email_service, 'send_email_by_template')

    # Sample data
    operator_legal_name = "Test Operator"
    external_user_full_name = "John Doe"
    external_user_email_address = "send_operator_access_request_email@email.test"

    expected_context = {
        "operator_legal_name": operator_legal_name,
        "external_user_full_name": external_user_full_name,
        "external_user_email_address": external_user_email_address,
    }

    for access_type in AccessRequestTypes:
        for access_state in AccessRequestStates:
            template_name = f"{access_type.value} Access Request {access_state.value}"
            transaction_id = uuid.uuid4()
            message_id = uuid.uuid4()
            mocked_send_email_by_template.return_value = {'txId': transaction_id, 'messages': [{'msgId': message_id}]}
            # Get the template instance
            template_instance = EmailNotificationTemplateService.get_template_by_name(template_name)

            # Make sure we don't have an email notification for the user before they request admin access
            assert not EmailNotification.objects.filter(
                transaction_id=transaction_id,
                message_id=message_id,
                template=template_instance,
                recipients_email=[external_user_email_address],
            ).exists()

            # Call the function
            send_operator_access_request_email(
                access_state, access_type, operator_legal_name, external_user_full_name, external_user_email_address
            )

            # Assert that send_email_by_template is called with the correct data
            mocked_send_email_by_template.assert_called_with(
                template_instance, expected_context, [external_user_email_address]
            )

            # Assert that an email notification record was created
            assert EmailNotification.objects.filter(
                transaction_id=transaction_id,
                message_id=message_id,
                template=template_instance,
                recipients_email=[external_user_email_address],
            ).exists()


def test_send_boro_id_application_email(mocker):
    mocked_send_email_by_template = mocker.patch.object(email_service, 'send_email_by_template')
    # Sample data
    operator_legal_name = "Test Operator"
    operation_name = "Test Operation"
    external_users = [Recipient(full_name="John Doe", email_address="send_boro_id_application_email@email.test")]

    for opted_in in [True, False]:
        for application_state in BoroIdApplicationStates:
            template_name = f"{'Opt-in And ' if opted_in else ''}BORO ID Application {application_state.value}"
            transaction_id = uuid.uuid4()
            message_id = uuid.uuid4()
            mocked_send_email_by_template.return_value = {'txId': transaction_id, 'messages': [{'msgId': message_id}]}
            # Get the template instance
            template_instance = EmailNotificationTemplateService.get_template_by_name(template_name)

            for recipient in external_users:
                expected_context = {
                    "operator_legal_name": operator_legal_name,
                    "operation_name": operation_name,
                    "external_user_full_name": recipient.full_name,
                    "external_user_email_address": recipient.email_address,
                }

                # Make sure we don't have an email notification for the user before they request admin access
                assert not EmailNotification.objects.filter(
                    transaction_id=transaction_id,
                    message_id=message_id,
                    template=template_instance,
                    recipients_email=[recipient.email_address],
                ).exists()

                # Call the function
                send_boro_id_application_email(
                    application_state, operator_legal_name, operation_name, opted_in, external_users
                )

                # Assert that send_email_by_template is called with the correct data
                mocked_send_email_by_template.assert_called_with(
                    template_instance, expected_context, [recipient.email_address]
                )

                # Assert that an email notification record was created
                assert EmailNotification.objects.filter(
                    transaction_id=transaction_id,
                    message_id=message_id,
                    template=template_instance,
                    recipients_email=[recipient.email_address],
                ).exists()
