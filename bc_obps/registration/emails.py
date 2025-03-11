from typing import List, Optional
from registration.enums.enums import AccessRequestStates, AccessRequestTypes
from service.email.email_service import EmailService
from registration.enums.enums import BoroIdApplicationStates
import logging

from registration.models import User
from service.data_access_service.email_template_service import EmailNotificationTemplateService

logger = logging.getLogger(__name__)

email_service = EmailService()


class Recipient:
    def __init__(self, full_name: str, email_address: str):
        self.full_name = full_name
        self.email_address = email_address

    def __eq__(self, other: object) -> bool:
        if not isinstance(other, Recipient):
            return NotImplemented
        return self.full_name == other.full_name and self.email_address == other.email_address

    def __repr__(self) -> str:
        return f"Recipient(full_name={self.full_name}, email_address={self.email_address})"


def send_boro_id_application_email(
    application_state: BoroIdApplicationStates,
    operator_legal_name: str,
    operation_name: str,
    opted_in: Optional[bool],
    operation_creator: Optional[User],
) -> None:
    """
    Sends an email to the operation creator and point of contact regarding the BORO ID application based on the application state.

    Args:
        application_state: The state of the BORO ID application, which is used to determine which email template should be used.
        operator_legal_name: The legal name of the operator to use in the email template.
        operation_name: The name of the operation to use in the email template.
        opted_in: A boolean indicating whether or not the operation is required to register or is simply opting in.
        operation_creator: The user who created the operation.

    Raises:
        ValueError: If the email template is not found.

    Returns:
        None
    """

    template_name = f"{'Opt-in And ' if opted_in else ''}BORO ID Application {application_state.value}"
    template = EmailNotificationTemplateService.get_template_by_name(template_name)

    # prepare recipients list
    recipients: List[Recipient] = []
    if operation_creator:
        recipients.append(Recipient(full_name=operation_creator.get_full_name(), email_address=operation_creator.email))

    # populating email context for each recipient
    email_contexts = []
    for recipient in recipients:
        email_context = {
            "operator_legal_name": operator_legal_name,
            "operation_name": operation_name,
            "external_user_full_name": recipient.full_name,
            "external_user_email_address": recipient.email_address,
        }
        email_contexts.append(email_context)

    for context in email_contexts:
        try:
            email_address_to_send_email_to: Optional[str] = context.get('external_user_email_address')
            response_json = email_service.send_email_by_template(template, context, [email_address_to_send_email_to])
            # Create email notification record to store transaction and message IDs
            email_service.create_email_notification_record(
                response_json['txId'],
                response_json['messages'][0]['msgId'],
                [email_address_to_send_email_to],
                template.id,
            )
        except Exception as exc:
            logger.error(f'Logger: Exception sending BORO ID Application {application_state} email - {str(exc)}')


def send_operator_access_request_email(
    access_state: AccessRequestStates,
    access_type: AccessRequestTypes,
    operator_legal_name: str,
    external_user_full_name: str,
    external_user_email_address: str,
) -> None:
    """
    Sends an email to a user regarding an operator and their access request based on the access state and type.

    Args:
        access_state: The state of the operator access request.
        access_type: The type of the operator for the access request.
        operator_legal_name: The legal name of the operator to use in the email template.
        external_user_full_name: The full name of the external user to use in the email template.
        external_user_email_address: The email address of the external user to use in the email template.

    Raises:
        ValueError: If the email template is not found.

    Returns:
        None
    """
    template_name = f"{access_type.value} Access Request {access_state.value}"
    template = EmailNotificationTemplateService.get_template_by_name(template_name)

    email_context = {
        "operator_legal_name": operator_legal_name,
        "external_user_full_name": external_user_full_name,
        "external_user_email_address": external_user_email_address,
    }
    try:
        response_json = email_service.send_email_by_template(template, email_context, [external_user_email_address])
        # Create email notification record to store the transaction and message IDs
        email_service.create_email_notification_record(
            response_json.get('txId'),
            response_json.get('messages')[0]['msgId'],
            [external_user_email_address],
            template.id,
        )
    except Exception as exc:  # not raising exception here to avoid breaking the flow of the application
        logger.error(f'Logger: Exception sending operator access request email - {str(exc)}')
