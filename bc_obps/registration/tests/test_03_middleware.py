import json
import pytest
from django.http import HttpRequest, HttpResponse
from django.test import TestCase, RequestFactory
from registration.middleware.current_user_middleware import CurrentUserMiddleware
from registration.middleware.kubernetes_middleware import KubernetesHealthCheckMiddleware
from registration.models import User
from model_bakery import baker
from localflavor.ca.models import CAPostalCodeField
from registration.tests.test_02_endpoints import mock_postal_code


pytestmark = pytest.mark.django_db

baker.generators.add(CAPostalCodeField, mock_postal_code)


class MiddlewareTestCase(TestCase):
    def test_liveness_endpoint(self):
        middleware = KubernetesHealthCheckMiddleware(None)
        request = HttpRequest()
        request.method = "GET"
        request.path = "/liveness"
        response = middleware(request)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.content, b'OK. Server is running.')

    def test_readiness_endpoint(self):
        middleware = KubernetesHealthCheckMiddleware(None)
        request = HttpRequest()
        request.method = "GET"
        request.path = "/readiness"
        response = middleware(request)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.content, b'OK. Server is ready.')


class MockGetResponse:
    def __call__(self, request):
        return HttpResponse()


class TestCurrentUserMiddleware:
    def _get_middleware(self):
        mock_get_response = MockGetResponse()
        return CurrentUserMiddleware(mock_get_response)

    def _get_request(self, **kwargs):
        return RequestFactory().get('/', **kwargs)

    def test_no_authorization_header(self):
        middleware = self._get_middleware()
        request = self._get_request()
        response = middleware(request)
        assert not hasattr(request, 'current_user')

    def test_invalid_authorization_header(self):
        middleware = self._get_middleware()
        request = self._get_request(HTTP_AUTHORIZATION='invalid_token')
        response = middleware(request)
        assert not hasattr(request, 'current_user')

    def test_valid_authorization_header(self):
        middleware = self._get_middleware()
        user = baker.make(User)
        auth_header = {'user_guid': str(user.user_guid)}
        request = self._get_request(HTTP_AUTHORIZATION=json.dumps(auth_header))
        response = middleware(request)
        assert hasattr(request, 'current_user')
        assert request.current_user == user

    def test_user_does_not_exist(self):
        middleware = self._get_middleware()
        auth_header = {'user_guid': 'non_existing_guid'}
        request = self._get_request(HTTP_AUTHORIZATION=json.dumps(auth_header))
        response = middleware(request)
        assert not hasattr(request, 'current_user')
