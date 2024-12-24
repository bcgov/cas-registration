from django.test import Client, TestCase
from registration.utils import custom_reverse_lazy


class TestOpenAPIDocs(TestCase):
    """
    Tests that the OpenAPI docs are accessible.
    """
    def test_openapi_docs_are_accessible(self):
        client = Client()
        response = client.get(custom_reverse_lazy('openapi-json'))
        self.assertEqual(response.status_code, 200)