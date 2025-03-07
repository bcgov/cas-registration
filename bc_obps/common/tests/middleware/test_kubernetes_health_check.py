from unittest.mock import MagicMock
from django.test import TestCase, RequestFactory
from common.middleware.kubernetes_health_check import KubernetesHealthCheckMiddleware


class TestKubernetesHealthCheckMiddleware(TestCase):
    def setUp(self):
        self.factory = RequestFactory()
        self.middleware = KubernetesHealthCheckMiddleware(lambda request: MagicMock(status_code=200))

    def test_liveness_endpoint(self):
        request = self.factory.get('/liveness')
        response = self.middleware(request)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.content, b'OK. Server is running.')

    def test_readiness_endpoint(self):
        request = self.factory.get('/readiness')
        response = self.middleware(request)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.content, b'OK. Server is ready.')
