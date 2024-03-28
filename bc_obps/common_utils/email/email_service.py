import json
from datetime import datetime, timedelta
from typing import List
from uuid import UUID

import requests
from django.conf import settings


class EmailService:
    def __init__(self):
        self.api_url = settings.CHES_API_URL
        self.client_id = settings.CHES_CLIENT_ID
        self.client_secret = settings.CHES_CLIENT_SECRET
        self.token_endpoint = settings.CHES_TOKEN_ENDPOINT
        self.token = None
        self.token_expiry = datetime.now()
        print(f'Initializing EmailService for clientID {self.client_id} to connect to {self.api_url}')

    def _get_token(self):
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
                raise Exception("Failed to retrieve CHES access token")

    def _make_request(self, endpoint, method='GET', data: any = None):
        headers = {"Authorization": f'Bearer {self.token}'} if self.token else {}
        print(f'Received request to {method} to {endpoint} with payload {data}')
        if method == 'GET':
            response = requests.get(self.api_url + endpoint, headers=headers, timeout=10)
        elif method == 'POST':
            response = requests.post(self.api_url + endpoint, headers=headers, json=data, timeout=10)
        else:
            raise ValueError("Invalid HTTP method")

        return response

    def health_check(self):
        self._get_token()
        try:
            response = self._make_request("/health")
            return response.json()
        except Exception as exc:
            raise Exception("Exception in /email/health_check ", str(exc))

    def get_message_status(self, message_id: UUID):
        """
        The CHES API uses these status enums:
        - accepted: email request is valid and has been added to the CHES database
        - pending: the message request is queued in CHES. Queue is usually processed within a few seconds, unless the scheduling feature has been used for the message
        - cancelled: an email that was still in the queue has been cancelled at the client's request
        - completed: the CHES API has dispatched the message to the STMP service. Cannot assert that the email was actually delivered to the recipient(s).
        - failed: the CHES API attempted to dispatch the message to the STMP service but the attempt failed.
        """
        self._get_token()
        try:
            response = self._make_request(f'/status/{message_id}')
            return response.json()
        except Exception as exc:
            raise Exception(f'Exception retrieving message status for {message_id} - ', str(exc))

    def send_email(self, email_data: dict):
        self._get_token()
        try:
            response = self._make_request(
                '/email',
                method='POST',
                data=email_data,
            )
            return response.json()
        except Exception as exc:
            raise Exception("Exception in send_email ", str(exc))

    def merge_template_and_send(self, email_template_data: dict):
        self._get_token()
        try:
            response = self._make_request("/emailMerge", method='POST', data=email_template_data)
            return response.json()
        except Exception as exc:
            raise Exception('Exception in merging template and sending! ', str(exc))
