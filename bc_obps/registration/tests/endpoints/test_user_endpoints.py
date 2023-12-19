from django.forms import model_to_dict
import pytest
import json
from model_bakery import baker
from registration.models import (
    User,
)
from registration.schema import UserIn
from registration.utils import TestUtils
import uuid
from django.core.management import call_command
from django.test import Client
from registration.enums.enums import IdPs

pytestmark = pytest.mark.django_db

base_endpoint = "/api/registration/"

content_type_json = "application/json"

client = Client()


@pytest.fixture(scope='function')
def app_role_fixture():
    # Load the fixture data into the test database
    call_command('loaddata', 'real/appRole.json')


class TestUserEndpoint:
    endpoint = base_endpoint + "user"
    endpoint_profile = endpoint + "-profile"

    def setup_method(self):
        self.user: User = baker.make(User)
        self.auth_header = {'user_guid': str(self.user.user_guid)}
        self.auth_header_dumps = json.dumps(self.auth_header)

    def test_unauthorized_users_cannot_get(self):
        # /user
        response = TestUtils.mock_get_with_auth_role(self, "cas_pending")
        assert response.status_code == 401

    # GET USER
    def test_get_user(self):

        # Act
        response = TestUtils.mock_get_with_auth_role(self, 'industry_user', self.endpoint)
        content = response.json()

        # Assert
        assert response.status_code == 200

        # Additional Assertions
        assert 'first_name' in content and isinstance(content['first_name'], str) and content['first_name'] != ''
        assert 'last_name' in content and isinstance(content['last_name'], str) and content['last_name'] != ''
        assert (
            'position_title' in content
            and isinstance(content['position_title'], str)
            and content['position_title'] != ''
        )
        assert 'email' in content and isinstance(content['email'], str) and '@' in content['email']
        assert (
            'street_address' in content
            and isinstance(content['street_address'], str)
            and content['street_address'] != ''
        )
        assert 'municipality' in content and isinstance(content['municipality'], str) and content['municipality'] != ''
        assert 'province' in content and isinstance(content['province'], str) and content['province'] != ''
        assert 'postal_code' in content and isinstance(content['postal_code'], str) and content['postal_code'] != ''

        # Additional Assertion for user_guid
        assert 'user_guid' not in content

    # GET USER PROFILE
    def test_get_user_profile(self):

        # Arrange
        url = f"{self.endpoint_profile}"

        # Act
        response = TestUtils.mock_get_with_auth_role(self, 'cas_admin', url)
        content = response.json()

        # Assert
        assert response.status_code == 200

        # Additional Assertions
        assert 'first_name' in content and isinstance(content['first_name'], str) and content['first_name'] != ''
        assert 'last_name' in content and isinstance(content['last_name'], str) and content['last_name'] != ''
        assert (
            'position_title' in content
            and isinstance(content['position_title'], str)
            and content['position_title'] != ''
        )
        assert 'email' in content and isinstance(content['email'], str) and '@' in content['email']
        assert 'phone_number' in content and isinstance(content['phone_number'], str)

        # Additional Assertion for user_guid
        assert 'user_guid' not in content

    # # POST USER PROFILE BCEIDBUSINESS
    @pytest.mark.usefixtures('app_role_fixture')
    def test_create_user_profile_bceidbusiness(self):

        # Arrange
        mock_payload = UserIn(
            first_name='Bceid',
            last_name='User',
            email='bceid.user@email.com',
            phone_number='123456789',
            position_title='Tester',
        )

        # Act
        # Construct the endpoint URL for identity_provider "bceidbusiness"
        response = client.post(
            f"{self.endpoint_profile}/{IdPs.BCEIDBUSINESS.value}",
            content_type=content_type_json,
            data=mock_payload.json(),
            HTTP_AUTHORIZATION=json.dumps({'user_guid': str(uuid.uuid4())}),
        )
        content = response.json()

        # Assert
        assert response.status_code == 200

        # Additional Assertions
        assert 'app_role' in content and content["app_role"]["role_name"] == "industry_user"
        assert 'first_name' in content and isinstance(content['first_name'], str) and content['first_name'] == 'Bceid'
        assert 'last_name' in content and isinstance(content['last_name'], str) and content['last_name'] == 'User'
        assert (
            'position_title' in content
            and isinstance(content['position_title'], str)
            and content['position_title'] == 'Tester'
        )
        assert 'email' in content and isinstance(content['email'], str) and content['email'] == 'bceid.user@email.com'
        assert 'phone_number' in content and isinstance(content['phone_number'], str)

        # Additional Assertion for user_guid
        assert 'user_guid' not in content

    # POST USER PROFILE IDIR
    @pytest.mark.usefixtures('app_role_fixture')
    def test_create_user_profile_idir(self):

        # Arrange
        mock_payload = UserIn(
            first_name='Idir',
            last_name='User',
            email='idir.user@email.com',
            phone_number='987654321',
            position_title='Tester',
        )

        # Act
        # Construct the endpoint URL for identity_provider "idir"
        response = client.post(
            f"{self.endpoint_profile}/{IdPs.IDIR.value}",
            content_type=content_type_json,
            data=mock_payload.json(),
            HTTP_AUTHORIZATION=json.dumps({'user_guid': str(uuid.uuid4())}),
        )
        content = response.json()

        # Assert
        assert response.status_code == 200

        # Additional Assertions
        assert 'app_role' in content and content["app_role"]["role_name"] == "cas_pending"
        assert 'first_name' in content and isinstance(content['first_name'], str) and content['first_name'] == 'Idir'
        assert 'last_name' in content and isinstance(content['last_name'], str) and content['last_name'] == 'User'
        assert (
            'position_title' in content
            and isinstance(content['position_title'], str)
            and content['position_title'] == 'Tester'
        )
        assert 'email' in content and isinstance(content['email'], str) and content['email'] == 'idir.user@email.com'
        assert 'phone_number' in content and isinstance(content['phone_number'], str)

        # Additional Assertion for user_guid
        assert 'user_guid' not in content  # PUT USER PROFILE

    def test_update_user_profile(self):

        # Arrange
        mock_payload = UserIn(
            first_name='Test',
            last_name='User',
            email='test.user@email.com',
            phone_number='123459876',
            position_title='Boss',
        )

        # Act
        response = TestUtils.mock_put_with_auth_role(
            self, 'industry_user', content_type_json, mock_payload.json(), f"{self.endpoint_profile}"
        )
        content = response.json()

        # Assert
        assert response.status_code == 200

        # Additional Assertions
        assert 'first_name' in content and isinstance(content['first_name'], str) and content['first_name'] == 'Test'
        assert 'last_name' in content and isinstance(content['last_name'], str) and content['last_name'] == 'User'
        assert (
            'position_title' in content
            and isinstance(content['position_title'], str)
            and content['position_title'] == 'Boss'
        )
        assert 'email' in content and isinstance(content['email'], str) and content['email'] == 'test.user@email.com'
        assert 'phone_number' in content and isinstance(content['phone_number'], str)

        # Additional Assertion for user_guid
        assert 'user_guid' not in content
