from django.http import HttpRequest
from django.test import TestCase
from registration.middleware.kubernetes_middleware import KubernetesHealthCheckMiddleware


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
