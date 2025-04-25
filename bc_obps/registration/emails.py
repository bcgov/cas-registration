from typing import List, Optional
from registration.enums.enums import AccessRequestStates, AccessRequestTypes
from registration.models.operation import Operation
from service.email.email_service import EmailService
from registration.enums.enums import BoroEmailTemplateNames
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


def send_registration_and_boro_id_email(
    template_name: BoroEmailTemplateNames,
    operator_legal_name: str,
    operation: Operation,
    registration_creator: Optional[User],
) -> None:
    """
    Sends an email to the person who submitted the registration and the operation representatives regarding the registration and BORO ID issuance.

    Args:
        template_name: The name of the email template to send.
        operator_legal_name: The legal name of the operator to use in the email template.
        operation: The operation that is being registered/issued a BORO ID.
        registration_creator: The user who created the operation.

    Raises:
        ValueError: If the email template is not found.

    Returns:
        None
    """
    template = EmailNotificationTemplateService.get_template_by_name(template_name)

    # prepare recipients list
    recipients: List[Recipient] = []
    if registration_creator:
        recipients.append(
            Recipient(full_name=registration_creator.get_full_name(), email_address=registration_creator.email)
        )

    for rep in operation.get_operation_representatives():
        recipients.append(Recipient(full_name=rep.get_full_name(), email_address=rep.email))

    # populating email context for each recipient
    email_contexts = []
    for recipient in recipients:
        email_context = {
            "operator_legal_name": operator_legal_name,
            "operation_name": operation.name,
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
            logger.error(f'Logger: Exception sending {str(template)} email - {str(exc)}')


def send_operator_access_request_email(
    access_state: AccessRequestStates,
    access_type: AccessRequestTypes,
    operator_legal_name: str,
    external_user_full_name: str,
    external_user_email_address: str,
) -> None:
    """
    Sends an email to a user regarding their operator access request  based on the access state and type.

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
