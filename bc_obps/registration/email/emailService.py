import json
from typing import List
import requests
from uuid import UUID
from django.conf import settings
from datetime import datetime, timedelta

from registration.email.schema import EmailIn, BodyType, TemplateMergeIn


class EmailService:
    def __init__(self):
        self.apiUrl = settings.CHES_API_URL
        self.clientID = settings.CHES_CLIENT_ID
        self.clientSecret = settings.CHES_CLIENT_SECRET
        self.tokenEndpoint = settings.CHES_TOKEN_ENDPOINT
        self.token = None
        self.tokenExpiry = datetime.now()
        print(f'Initializing EmailService for clientID {self.clientID} to connect to {self.apiUrl}')

    def _get_token(self):
        if not self.token or self.tokenExpiry < datetime.now():
            response = requests.post(
                self.tokenEndpoint,
                auth=(self.clientID, self.clientSecret),
                data={"grant_type": "client_credentials"},
                timeout=10,
            )
            if response.status_code == 200:
                self.token = response.json()["access_token"]
                self.tokenExpiry = datetime.now() + timedelta(seconds=response.json()["expires_in"])
            else:
                raise Exception("Failed to retrieve CHES access token")

    def _make_request(self, endpoint, method='GET', data: any = None):
        headers = {"Authorization": f'Bearer {self.token}'} if self.token else {}
        print(f'Received request to {method} to {endpoint} with payload {data}')
        if method == 'GET':
            response = requests.get(self.apiUrl + endpoint, headers=headers, timeout=10)
        elif method == 'POST':
            response = requests.post(self.apiUrl + endpoint, headers=headers, json=data, timeout=10)
        else:
            raise ValueError("Invalid HTTP method")

        return response

    def health_check(self):
        self._get_token()
        try:
            response = self._make_request("/health")
            return response.json()
        except Exception as exc:
            print("Exception in /email/health_check ", str(exc))

    def get_message_status(self, msgId: UUID):
        self._get_token()
        try:
            response = self._make_request(f'/status/{msgId}')
            return response.json()
        except Exception as exc:
            print(f'Exception retrieving message status for {msgId} - ', str(exc))

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
            print("Exception in send_email ", str(exc))

    def merge_template_and_send(self, email_template_data: dict):
        self._get_token()
        try:
            response = self._make_request("/emailMerge", method='POST', data=email_template_data)
            return response.json()
        except Exception as exc:
            print('Exception in merging template and sending! ', str(exc))
