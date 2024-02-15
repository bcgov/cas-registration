import json, uuid
from registration.schema import UserIn
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.enums.enums import IdPs
from registration.utils import custom_reverse_lazy


class TestUserEndpoint(CommonTestSetup):
    def test_unauthorized_users_cannot_get(self):
        # /user
        response = TestUtils.mock_get_with_auth_role(self, "cas_pending", custom_reverse_lazy('get_user'))
        assert response.status_code == 401

    # GET USER
    def test_get_user(self):
        # Act
        response = TestUtils.mock_get_with_auth_role(self, 'industry_user', custom_reverse_lazy('get_user'))
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
        # Additional Assertion for user_guid
        assert 'user_guid' not in content

    # GET USER PROFILE
    def test_get_user_profile(self):
        # Act
        response = TestUtils.mock_get_with_auth_role(self, 'cas_admin', custom_reverse_lazy('get_user_profile'))
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
    def test_create_user_profile_bceidbusiness(self):
        # Arrange
        mock_payload = UserIn(
            first_name='Bceid',
            last_name='User',
            email='bceid.user@email.com',
            phone_number='+16044011234',
            position_title='Tester',
            business_guid='00000000-0000-0000-0000-000000000001',
            bceid_business_name='test business',
        )

        # Act
        # Construct the endpoint URL for identity_provider "bceidbusiness"
        response = TestUtils.client.post(
            custom_reverse_lazy('create_user_profile', kwargs={'identity_provider': IdPs.BCEIDBUSINESS.value}),
            content_type=self.content_type,
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
        assert (
            'bceid_business_name' in content
            and isinstance(content['bceid_business_name'], str)
            and content['bceid_business_name'] == 'test business'
        )

        # Additional Assertion for user_guid
        assert 'user_guid' not in content
        assert 'business_guid' not in content

    # POST USER PROFILE IDIR
    def test_create_user_profile_idir(self):
        # Arrange
        mock_payload = UserIn(
            first_name='Idir',
            last_name='User',
            email='idir.user@email.com',
            phone_number='+16044011234',
            position_title='Tester',
            business_guid='00000000-0000-0000-0000-000000000000',
            bceid_business_name='bcgov test',
        )

        # Act
        # Construct the endpoint URL for identity_provider "idir"
        response = TestUtils.client.post(
            custom_reverse_lazy('create_user_profile', kwargs={'identity_provider': IdPs.IDIR.value}),
            content_type=self.content_type,
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
        assert (
            'bceid_business_name' in content
            and isinstance(content['bceid_business_name'], str)
            and content['bceid_business_name'] == 'bcgov test'
        )

        # Additional Assertion for user_guid
        assert 'user_guid' not in content  # PUT USER PROFILE
        assert 'business_guid' not in content

    def test_update_user_profile(self):
        # Arrange
        mock_payload = UserIn(
            first_name='Test',
            last_name='User',
            email='test.user@email.com',
            phone_number='+16044011234',
            position_title='Boss',
            business_guid='00000000-0000-0000-0000-000000000001',
            bceid_business_name='test business',
        )

        # Act
        response = TestUtils.mock_put_with_auth_role(
            self,
            'industry_user',
            self.content_type,
            mock_payload.json(),
            custom_reverse_lazy('update_user_profile'),
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
        assert (
            'bceid_business_name' in content
            and isinstance(content['bceid_business_name'], str)
            and content['bceid_business_name'] == 'test business'
        )

        # Additional Assertion for user_guid
        assert 'user_guid' not in content
        assert 'business_guid' not in content
