from django.test import Client
import pytest


@pytest.mark.django_db
class TestReportsEndpoint:
    endpointUnderTest = "/api/reporting/reports"

    def test_error_if(self):
        client = Client()
        request_data = {"operation_id": "abc", "reporting_year": 2000}
        response = client.post(self.endpointUnderTest, data=request_data)

        assert response.status_code == 90

    def test_success_if(self):
        print("no")
