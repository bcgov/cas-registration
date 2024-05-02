from registration.enums.enums import AccessRequestStates, AccessRequestTypes, OperatorAccessRequest
from common.service.email.email_service import EmailService
from common.models import EmailNotificationTemplate
from registration.enums.enums import BoroIdApplication, BoroIdApplicationStates
import logging

logger = logging.getLogger(__name__)

email_service = EmailService()


def send_boro_id_application_email(
    application_state: BoroIdApplicationStates,
    operator_legal_name: str,
    operation_name: str,
    external_user_full_name: str,
    external_user_email_address: str,
) -> None:
    """
    Sends an email to an external user regarding an operation's BORO ID application, based on the application_state.
    Args:
        application_state: The state of the BORO ID application, which is used to determine which email template should be used.
        operator_legal_name: The legal name of the operator to use in the email template.
        operation_name: The name of the operation to use in the email template.
        external_user_full_name: The full name of the external user to use in the email template.
        external_user_email_address: The email address of the external user, who will be the recipient of the email.
    Raises:
        ValueError: If the email template is not found
    Returns:
        None
    """
    try:
        print("Fetching template...")
        template_name = BoroIdApplication.generate_boro_id_application_template_name(application_state)
        template = EmailNotificationTemplate.objects.get(name=template_name)
    except EmailNotificationTemplate.DoesNotExist:
        raise ValueError("Email template not found")
    email_context = {
        "operator_legal_name": operator_legal_name,
        "operation_name": operation_name,
        "external_user_full_name": external_user_full_name,
        "external_user_email_address": external_user_email_address,
    }
    try:
        print("SENDING THE EMAIL!!!!")
        print(email_context)
        response_json = email_service.send_email_by_template(template, email_context, [external_user_email_address])
        # Create email notification record to store transaction and message IDs
        email_service.create_email_notification_record(
            response_json['txId'], response_json['messages'][0]['msgId'], [external_user_email_address], template.id
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

    try:
        template_name = OperatorAccessRequest.generate_access_request_template_name(
            access_type.value, access_state.value
        )
        template = EmailNotificationTemplate.objects.get(name=template_name)
    except EmailNotificationTemplate.DoesNotExist:
        raise ValueError("Email template not found")

    email_context = {
        "operator_legal_name": operator_legal_name,
        "external_user_full_name": external_user_full_name,
        "external_user_email_address": external_user_email_address,
    }

    try:
        response_json = email_service.send_email_by_template(template, email_context, [external_user_email_address])
        # Create email notification record to store the transaction and message IDs
        email_service.create_email_notification_record(
            response_json['txId'], response_json['messages'][0]['msgId'], [external_user_email_address], template.id
        )
    except Exception as exc:  # not raising exception here to avoid breaking the flow of the application
        logger.error(f'Logger: Exception sending operator access request email - {str(exc)}')
