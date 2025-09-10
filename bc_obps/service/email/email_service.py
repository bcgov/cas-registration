from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional, TypedDict, Union
import typing
from uuid import UUID
import logging
import requests
from django.utils import timezone
from common.models import EmailNotification, EmailNotificationTemplate
from django.conf import settings

logger = logging.getLogger(__name__)

SENDER_EMAIL = 'no-reply.cas@gov.bc.ca'
GHG_REGULATOR_EMAIL = 'GHGRegulator@gov.bc.ca'


class Message(TypedDict):
    msgId: str
    tag: str
    to: List[str]


class EmailResponseType(TypedDict):
    messages: List[Message]
    txId: str


class EmailService(object):
    """
    EmailService uses Common Hosted Email Service (CHES) API to enqueue emails for delivery. Uses BC Government-hosted SMTP server to send emails.
    NOTE: Use `email_service = EmailService()` to access the EmailService singleton object in other .py files
    """

    _instance = None
    token: Optional[str]  # Define type for token
    token_expiry: datetime  # Define type for token_expiry
    token_endpoint: str
    api_url: str
    client_id: str
    client_secret: str

    # Singleton pattern to ensure only one instance of EmailService is created
    @typing.no_type_check
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(EmailService, cls).__new__(cls)
            cls._instance.api_url = settings.CHES_API_URL
            cls._instance.client_id = settings.CHES_CLIENT_ID
            cls._instance.client_secret = settings.CHES_CLIENT_SECRET
            cls._instance.token_endpoint = settings.CHES_TOKEN_ENDPOINT
            cls._instance.token = None
            cls._instance.token_expiry = timezone.now()
            logger.info(
                f'Logger: Initializing EmailService for clientID {cls._instance.client_id} to connect to {cls._instance.api_url}'
            )
        return cls._instance

    def _get_token(self) -> None:
        """
        Every other function within EmailService should begin by calling this function.

        If EmailService() object already has a valid token, no action is taken. Otherwise, will make call
        to {self.token_endpoint} to renew CHES API access_token using credentials
        {self.client_id} and {self.client_secret}. Then updates stored values
        {self.token} and {self.token_expiry}.
        """
        try:
            if not self.token or self.token_expiry < timezone.now():
                response = requests.post(
                    self.token_endpoint,
                    auth=(self.client_id, self.client_secret),
                    data={"grant_type": "client_credentials"},
                    timeout=10,
                )
                if response.status_code == 200:
                    self.token = response.json()["access_token"]
                    self.token_expiry = timezone.now() + timedelta(seconds=response.json()["expires_in"])
                else:
                    logger.error("Logger: Failed to retrieve CHES access token")
        except Exception as exc:
            logger.error(f'Logger: Exception in _get_token {str(exc)}')

    def _make_request(
        self, endpoint: str, method: Optional[str] = 'GET', data: Optional[Any] = None
    ) -> requests.Response:
        """
        Helper function to build and send either GET or POST request to CHES API with appropriate headers.
        """
        headers = {"Authorization": f'Bearer {self.token}'} if self.token else {}
        if method == 'GET':
            response = requests.get(self.api_url + endpoint, headers=headers, timeout=10)
        elif method == 'POST':
            response = requests.post(self.api_url + endpoint, headers=headers, json=data, timeout=10)
        else:
            raise ValueError("Invalid HTTP method")

        return response

    def health_check(self) -> Optional[Any]:
        """
        Retrieves health check data from CHES API.
        Response is a dict with key "dependencies", containing a list of 3 dicts (one for each component).
        For each key name ("database", "queue", and "smtp"), there is a corresponding key "healthy" with True/False.
        """
        self._get_token()
        try:
            response = self._make_request("/health")
            return response.json()
        except Exception as exc:
            logger.error(f'Logger: Exception in /email/health_check {str(exc)}')
            raise

    def get_message_status(self, message_id: UUID) -> Optional[Any]:
        """
        Given a message_id (which is different from a transaction_id), returns the status of the message.

        The CHES API uses these status enums:
        - accepted: email request is valid and has been added to the CHES database
        - pending: the message request is queued in CHES. Queue is usually processed within a few seconds, unless the scheduling feature has been used for the message
        - cancelled: an email that was still in the queue has been cancelled at the client's request
        - completed: the CHES API has dispatched the message to the STMP service. Cannot assert that the email was actually delivered to the recipient(s).
        - failed: the CHES API attempted to dispatch the message to the STMP service but the attempt failed.

        CHES API also provides option to query status by transaction ID rather than message ID. Querying by transaction ID has not been implemented in EmailService.
        """
        self._get_token()
        try:
            response = self._make_request(f'/status/{message_id}')
            return response.json()
        except Exception as exc:
            logger.error(f'Logger: Exception retrieving message status for {message_id} - {str(exc)}')
            raise

    def merge_template_and_send(self, email_template_data: Dict) -> Optional[Any]:
        """
        Given an email template with variables for customized content, CHES API merges the template with the given
        "contexts" (values of variables) and sends each message to the CHES API queue for email delivery. Each "context"
        will be sent out as a separate email.

        Required input data:
            {
                'bodyType': 'text' | 'html',
                'body': str,
                'contexts': [
                    {
                        'context': dict,
                        'to': List[str],
                        'cc': List[str],
                    }
                ],
                'from': str,
                'subject': str,
            }
        See {self.api_url}/docs or email_template fixture in test_email_service.py for examples of how to use contexts.

        Response contains 'txId' (transaction ID) and list of 'msgId's (message IDs), to be used as identifiers when querying message or transaction status.
        """
        self._get_token()
        try:
            response = self._make_request("/emailMerge", method='POST', data=email_template_data)
            return response.json()
        except Exception as exc:
            logger.error(f'Logger: Exception in merging template and sending! - {str(exc)}')
            raise

    def send_email_by_template(
        self, template_instance: EmailNotificationTemplate, email_context: dict, recipients_email: List[str]
    ) -> Optional[EmailResponseType]:
        """
        Sends an email using the provided email template, email context, and recipient email addresses.

        Args:
            template_instance: An instance of the EmailNotificationTemplate class representing the email template.
            email_context: A dictionary containing the context variables to be used in the email template.
            recipients_email: A list of recipient email addresses.

        Returns:
            Optional[dict]: A dictionary containing the response from the email service provider, or None if the email sending fails.
        """
        email_data = {
            'bodyType': 'html',
            'body': template_instance.body,
            'contexts': [
                {
                    'context': email_context,
                    'to': recipients_email,
                    'cc': [GHG_REGULATOR_EMAIL],
                }
            ],
            'from': SENDER_EMAIL,
            'subject': template_instance.subject,
        }
        return self.merge_template_and_send(email_data)

    def create_email_notification_record(
        self,
        transaction_id: Union[UUID, str],
        message_id: Union[UUID, str],
        recipients_email: List[str],
        template_id: int,
    ) -> None:
        """
        Creates a new email notification record in the database.

        Args:
            transaction_id: The ID of the transaction associated with the email notification.
            message_id: The ID of the email message.
            recipients_email: A list of email addresses of the recipients.
            template_id: The ID of the email template.

        Returns:
            None
        """
        EmailNotification.objects.create(
            transaction_id=transaction_id,
            message_id=message_id,
            recipients_email=recipients_email,
            template_id=template_id,
        )
