import pytest
from datetime import datetime
from uuid import UUID
from unittest.mock import patch
from common_utils.email.email_service import EmailService


@pytest.fixture
def email_service():
    return EmailService()


# NOTE: Most of this mock data was pulled from sample payloads from the CHES API docs
# at https://ches.api.gov.bc.ca/api/v1/docs


@pytest.fixture
def email_data():
    return {
        'bodyType': 'text',
        'body': 'This is the body of a test email for BCIERS Email Service',
        'from': 'ggircs@gov.bc.ca',
        'subject': 'Automated Test of Email_Service',
        'to': ['baz@gov.bc.ca'],
    }


@pytest.fixture
def email_template():
    return {
        'attachments': [
            {
                'content': 'PGI+SGVsbG8gV29ybGRcITwvYj4=',
                'contentType': 'string',
                'encoding': 'base64',
                'filename': 'testfile.txt',
            }
        ],
        'bodyType': 'html',
        'body': '{{ something.greeting }} {{ something.target }} content',
        'contexts': [
            {
                'bcc': ['foo@gov.bc.ca'],
                'cc': ['fizz@gov.bc.ca'],
                'context': {'something': {'greeting': 'Hello', 'target': 'World'}, 'someone': 'user'},
                'delayTS': 1570000000,
                'tag': 'tag',
                'to': ['baz@gov.bc.ca'],
            }
        ],
        'encoding': 'utf-8',
        'from': 'example@gov.bc.ca',
        'priority': 'normal',
        'subject': 'Hello {{ someone }}',
    }


def test_get_token(email_service):
    email_service._get_token()
    assert email_service.token is not None
    assert email_service.token_expiry > datetime.now()


def test_health_check(email_service):
    resp = email_service.health_check()
    assert isinstance(resp, dict)
    assert len(resp['dependencies']) == 3
    dependency_names = ['database', 'queue', 'smtp']
    for dep in resp['dependencies']:
        assert dep['name'] in dependency_names
        assert dep.get('healthy') is not None


def test_send_email(email_service, email_data):
    with patch.object(email_service, '_make_request') as mock_send_email_request:
        mock_send_email_request.return_value.json.return_value = {
            'messages': [{'msgId': '0000000-00000-0000-0000001', 'to': ['sample@email.com']}],
            'txId': '00000000-0000-0000-0000-000000000000',
        }
        response = email_service.send_email(email_data)
        assert len(response['messages']) == 1
        assert response['txId'] == '00000000-0000-0000-0000-000000000000'
        assert response['messages'][0]['msgId'] == '0000000-00000-0000-0000001'
        assert response['messages'][0]['to'] == ['sample@email.com']


def test_get_message_status(email_service):
    with patch.object(email_service, '_make_request') as mock_get_status_request:
        mock_get_status_request.return_value.json.return_value = {
            'createdTS': 1560000000,
            'delayTS': 1570000000,
            'msgId': '00000000-0000-0000-0000-000000000000',
            'smtpResponse': {
                'smtpMsgId': '<11111111-1111-1111-1111-111111111111@gov.bc.ca>',
                'response': '250 2.6.0 <11111111-1111-1111-1111-111111111111@gov.bc.ca> [InternalId=82420422419525, Hostname=E6PEDG05.idir.BCGOV] 1464 bytes in 0.225, 6.333 KB/sec Queued mail for delivery',
            },
            'status': 'completed',
            'statusHistory': [{'description': 'string', 'status': 'completed', 'timestamp': 0}],
            'tag': 'tag',
            'txId': '00000000-0000-0000-0000-000000000000',
            'updatedTS': 1570000000,
        }
        response = email_service.get_message_status(UUID('00000000-0000-0000-0000-000000000000'))
        assert response['status'] == 'completed'
        assert response['txId'] == '00000000-0000-0000-0000-000000000000'


def test_merge_template_and_send(email_service, email_template):
    with patch.object(email_service, '_make_request') as mock_merge_template_request:
        mock_merge_template_request.return_value.json.return_value = [
            {
                'messages': [{'msgId': '00000000-0000-0000-0000-000000000000', 'tag': 'tag', 'to': ['baz@gov.bc.ca']}],
                'txId': '00000000-0000-0000-0000-000000000000',
            }
        ]
        response = email_service.merge_template_and_send(email_template)
        assert len(response) == 1
        assert response[0]['txId'] == '00000000-0000-0000-0000-000000000000'
        assert len(response[0]['messages']) == 1
        assert response[0]['messages'][0]['to'] == ['baz@gov.bc.ca']
