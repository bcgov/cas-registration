from django.http import HttpRequest
from django.test import SimpleTestCase
from reporting.api_v2.response_builder import PaginatedResponseBuilder, ResponseBuilder
from reporting.constants import PAGE_SIZE


class TestResponseBuilder(SimpleTestCase):
    def test_constructor(self):
        builder = ResponseBuilder()
        # Assert empty response object is present
        response = builder.build()
        self.assertEqual(response, {})

    def test_payload_assignment(self):
        builder = ResponseBuilder()
        sample_payload = {"key": "value"}
        builder.payload(sample_payload)
        response = builder.build()
        self.assertEqual(response, {"payload": sample_payload})


class TestPaginatedResponseBuilder(SimpleTestCase):
    def test_constructor(self):
        builder = PaginatedResponseBuilder(HttpRequest())
        # Assert empty response object is present on init
        response = builder.build()
        self.assertEqual(response, {"payload": {"items": []}})
        # Assert default pagination settings
        self.assertEqual(builder.pagination.page, 1)
        self.assertEqual(builder.pagination.page_size, PAGE_SIZE)

    def test_pagination_properties_overridden_by_request(self):
        request = HttpRequest()
        request.GET = request.GET.copy()
        request.GET['page'] = 2
        request.GET['page_size'] = 50
        builder = PaginatedResponseBuilder(request=request, page=1, page_size=1)
        self.assertEqual(builder.pagination.page, 2)
        self.assertEqual(builder.pagination.page_size, 50)
        builder.build()  # Just to ensure no errors on build

    def test_payload_assignment(self):
        builder = PaginatedResponseBuilder(HttpRequest())
        sample_queryset = range(100)  # Simulating a queryset with 100 items
        builder.payload(sample_queryset)
        response = builder.build()
        self.assertIn('payload', response)
        self.assertIn('items', response['payload'])
        self.assertEqual(len(response['payload']['items']), PAGE_SIZE)  # Default page size items returned
