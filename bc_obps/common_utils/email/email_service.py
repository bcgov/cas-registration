from datetime import datetime, timedelta
from typing import Optional
from uuid import UUID
import logging

import requests
from django.conf import settings

logger = logging.getLogger(__name__)


class EmailService:
    """
    EmailService uses Common Hosted Email Service (CHES) API to enqueue emails for delivery. Uses BC Government-hosted SMTP server to send emails.
    """

    def __init__(self):
        self.api_url: str = settings.CHES_API_URL
        self.client_id: str = settings.CHES_CLIENT_ID
        self.client_secret: str = settings.CHES_CLIENT_SECRET
        self.token_endpoint: str = settings.CHES_TOKEN_ENDPOINT
        self.token: Optional[str] = None
        self.token_expiry: datetime = datetime.now()
        logger.info(f'Initializing EmailService for clientID {self.client_id} to connect to {self.api_url}')

    def _get_token(self):
        """
        Every other function within EmailService should begin by calling this function.

        If EmailService() object already has a valid token, no action is taken. Otherwise, will make call
        to {self.token_endpoint} to renew CHES API access_token using credentials
        {self.client_id} and {self.client_secret}. Then updates stored values
        {self.token} and {self.token_expiry}.
        """
        if not self.token or self.token_expiry < datetime.now():
            response = requests.post(
                self.token_endpoint,
                auth=(self.client_id, self.client_secret),
                data={"grant_type": "client_credentials"},
                timeout=10,
            )
            if response.status_code == 200:
                self.token = response.json()["access_token"]
                self.token_expiry = datetime.now() + timedelta(seconds=response.json()["expires_in"])
            else:
                logger.error("Failed to retrieve CHES access token")

    def _make_request(self, endpoint, method='GET', data: any = None):
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

    def health_check(self):
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
            logger.error(f'Exception in /email/health_check {str(exc)}')
            raise

    def get_message_status(self, message_id: UUID):
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
            logger.error(f'Exception retrieving message status for {message_id} - {str(exc)}')
            raise

    def send_email(self, email_data: dict):
        """
        Email (content in either text or HTML format) is queued to be sent to each recipient listed in 'to'.

        Required input data:
            {
                'bodyType': 'text' | 'html',
                'body': str,
                'from': str (email),
                'subject': 'str,
                'to': List[str] (one email per str),
            }

        See {self.api_url}/docs for more (optional) fields.

        Response contains 'msgId' (message ID) and 'txId' (transaction ID), to be used as identifiers when querying message or transaction status.
        """
        self._get_token()
        try:
            response = self._make_request(
                '/email',
                method='POST',
                data=email_data,
            )
            return response.json()
        except Exception as exc:
            logger.error(f'Exception in send_email {str(exc)}')
            raise

    def merge_template_and_send(self, email_template_data: dict):
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
            logger.error(f'Exception in merging template and sending! - {str(exc)}')
            raise
