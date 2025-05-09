import pytest
from datetime import datetime, timedelta
from uuid import UUID
from service.email.email_service import EmailService

pytestmark = pytest.mark.django_db


@pytest.fixture
def email_service(mocker):
    email_service = EmailService()
    email_service.token_endpoint = "https://mock_token_endpoint"
    email_service.client_id = "mock_client_id"
    email_service.client_secret = "mock_client_secret"

    def _get_token_mock():
        email_service.token = "mocked_access_token"
        email_service.token_expiry = datetime.now() + timedelta(seconds=300)

    mocker.patch.object(email_service, '_get_token', side_effect=_get_token_mock)
    return email_service


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
def health_check_data():
    return {
        "dependencies": [
            {"name": "smtp", "healthy": True, "info": "SMTP Service connected successfully."},
            {"name": "database", "healthy": True, "info": "Database connected successfully."},
            {"name": "queue", "healthy": True, "info": "Queue is happy."},
        ]
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


def test_singleton_service(email_service: EmailService):
    """
    Test that the EmailService is a singleton
    """
    email_service._get_token()
    # Create a new instance of the EmailService
    new_email_service = EmailService()
    new_email_service._get_token()
    # Assert that the token and expiry are the same
    assert email_service.__dict__ == new_email_service.__dict__


def test_new_instance_attributes(email_service: EmailService):
    email_service_attributes = ['api_url', 'client_id', 'client_secret', 'token_endpoint', 'token_expiry']
    for key_name in email_service_attributes:
        assert hasattr(email_service, key_name)


def test_fetch_new_token(email_service: EmailService, mocker):
    current_time = datetime.now()

    email_service._get_token()

    assert email_service.token == "mocked_access_token"
    assert email_service.token_expiry > current_time
    # because of rounding funky-ness, using timedelta(seconds=300) doesn't reliably pass. Rounding up to 301 seconds does
    assert email_service.token_expiry <= current_time + timedelta(seconds=301)
    email_service._get_token.assert_called_once()


def test_get_token_when_expired(email_service: EmailService, mocker):
    email_service.token = "mock_expired_token"
    email_service.token_expiry = datetime.now() - timedelta(days=1)

    email_service._get_token()

    current_time = datetime.now()
    email_service._get_token.assert_called_once()
    assert email_service.token == "mocked_access_token"
    assert email_service.token_expiry > current_time
    assert email_service.token_expiry <= current_time + timedelta(minutes=5)


def test_health_check(email_service: EmailService, health_check_data, mocker):
    mock_health_request = mocker.patch.object(email_service, '_make_request')
    mock_health_request.return_value.json.return_value = health_check_data

    resp = email_service.health_check()
    assert len(resp['dependencies']) == 3
    dependency_names = ['database', 'smtp', 'queue']
    for dep in resp['dependencies']:
        assert dep['name'] in dependency_names
        assert dep.get('healthy') is not None
    email_service._get_token.assert_called_once()
    email_service._make_request.assert_called_once_with("/health")


def test_get_message_status(email_service: EmailService, mocker):
    mock_get_status_request = mocker.patch.object(email_service, '_make_request')
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
    email_service._get_token.assert_called_once()


def test_merge_template_and_send(email_service: EmailService, email_template, mocker):
    mock_merge_template_request = mocker.patch.object(email_service, '_make_request')
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
    email_service._get_token.assert_called_once()
