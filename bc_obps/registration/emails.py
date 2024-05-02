from typing import List
from common.service.email.email_service import EmailService
from common.models import EmailNotificationTemplate
from registration.enums.enums import BoroIdApplication, BoroIdApplicationStates
import logging

logger = logging.getLogger(__name__)

email_service = EmailService()


class Recipient:
    def __init__(self, full_name: str, email_address: str):
        self.full_name = full_name
        self.email_address = email_address


def send_boro_id_application_email(
    application_state: BoroIdApplicationStates,
    operator_legal_name: str,
    operation_name: str,
    external_users: List[Recipient],
) -> None:
    """
    Sends an email to an external user regarding an operation's BORO ID application, based on the application_state.

    Args:
        application_state: The state of the BORO ID application, which is used to determine which email template should be used.
        operator_legal_name: The legal name of the operator to use in the email template.
        operation_name: The name of the operation to use in the email template.
        external_users: A list of Recipient objects (consisting of full_name and email_address)

    Raises:
        ValueError: If the email template is not found

    Returns:
        None
    """

    try:
        template_name = BoroIdApplication.generate_boro_id_application_template_name(application_state)
        template = EmailNotificationTemplate.objects.get(name=template_name)
    except EmailNotificationTemplate.DoesNotExist:
        raise ValueError("Email template not found")

    email_contexts = []
    for recipient in external_users:
        email_context = {
            "operator_legal_name": operator_legal_name,
            "operation_name": operation_name,
            "external_user_full_name": recipient.full_name,
            "external_user_email_address": recipient.email_address,
        }
        email_contexts.append(email_context)

    for context in email_contexts:
        try:
            response_json = email_service.send_email_by_template(
                template, context, [context.get('external_user_email_address')]
            )
            # Create email notification record to store transaction and message IDs
            email_service.create_email_notification_record(
                response_json['txId'],
                response_json['messages'][0]['msgId'],
                [context.get('external_user_email_address')],
                template.id,
            )
        except Exception as exc:
            logger.error(f'Logger: Exception sending BORO ID Application {application_state} email - {str(exc)}')
