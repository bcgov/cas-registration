import json
from unittest.mock import MagicMock
from django.test import TestCase, RequestFactory
from registration.middleware.current_user import CurrentUserMiddleware
from registration.models import User
from model_bakery import baker


class TestCurrentUserMiddleware(TestCase):
    def setUp(self):
        self.factory = RequestFactory()
        self.middleware = CurrentUserMiddleware(lambda request: MagicMock(status_code=200))

    def test_no_authorization_header(self):
        middleware = self.middleware
        request = self.factory.get('/')
        middleware(request)
        assert not hasattr(request, 'current_user')

    def test_invalid_authorization_header(self):
        middleware = self.middleware
        request = self.factory.get('/', HTTP_AUTHORIZATION='invalid_token')
        middleware(request)
        assert not hasattr(request, 'current_user')

    def test_valid_authorization_header(self):
        middleware = self.middleware
        user = baker.make(User)
        auth_header = {'user_guid': str(user.user_guid)}
        request = self.factory.get('/', HTTP_AUTHORIZATION=json.dumps(auth_header))
        middleware(request)
        assert hasattr(request, 'current_user')
        assert request.current_user == user

    def test_user_does_not_exist(self):
        middleware = self.middleware
        auth_header = {'user_guid': 'non_existing_guid'}
        request = self.factory.get('/', HTTP_AUTHORIZATION=json.dumps(auth_header))
        middleware(request)
        assert not hasattr(request, 'current_user')

    def test_missing_user_guid_in_authorization_header(self):
        middleware = self.middleware
        auth_header = {}
        request = self.factory.get('/', HTTP_AUTHORIZATION=json.dumps(auth_header))
        response = middleware(request)
        assert response.status_code == 400
        self.assertEqual(
            json.loads(response.content.decode())["error"], "Invalid Authorization header"
        )

    def test_malformed_json_in_authorization_header(self):
        middleware = self.middleware
        request = self.factory.get('/', HTTP_AUTHORIZATION="invalid_json")
        response = middleware(request)
        assert response.status_code == 400
        self.assertEqual(
            json.loads(response.content.decode())["error"], "Invalid Authorization header"
        )

    def test_invalid_uuid_format_in_authorization_header(self):
        middleware = self.middleware
        auth_header = {"user_guid": "invalid_uuid"}
        request = self.factory.get('/', HTTP_AUTHORIZATION=json.dumps(auth_header))
        response = middleware(request)
        assert response.status_code == 400
        self.assertEqual(
            json.loads(response.content.decode())["error"], "Invalid Authorization header"
        )
