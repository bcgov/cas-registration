from django.test import Client
import json
import pytest

pytestmark = pytest.mark.django_db
client = Client()
pytest.endpoint = "/api/reporting/initial-activity-data"


class TestActivityData:
    def test_invalid_without_report_date(self):
        response = client.get(f'{pytest.endpoint}?activity_name=General stationary combustion excluding line tracing')
        assert response.status_code == 422

    def test_invalid_without_activity(self):
        response = client.get(f'{pytest.endpoint}?report_date=2024-05-01')
        assert response.status_code == 422

    def test_returns_activity_data(self):
        response = client.get(
            '/api/reporting/initial-activity-data?activity_name=General stationary combustion excluding line tracing&report_date=2024-05-01'
        )
        assert response.status_code == 200
        response_object = json.loads(response.json())
        assert response_object['activityId'] == 1
        # There are 2 source types in the map
        assert len(response_object['sourceTypeMap'].keys()) == 2
