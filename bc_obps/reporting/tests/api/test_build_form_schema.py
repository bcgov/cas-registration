from django.test import Client
import json
import pytest

pytestmark = pytest.mark.django_db
client = Client()
pytest.endpoint = "/api/reporting/build-form-schema"

class TestBuildFormSchema:
    def test_invalid_without_report_date(self):
        response = client.get(f'{pytest.endpoint}?activity=1')
        assert response.status_code == 400
        assert response.json().get('message') == "Cannot build a schema without a valid report date"

    def test_invalid_without_activity(self):
        response = client.get(f'{pytest.endpoint}?report_date=2024-05-01')
        assert response.status_code == 400
        assert response.json().get('message') == "Cannot build a schema without Activity data"

    def test_except_if_no_valid_configuration(self):
        response = client.get(f'{pytest.endpoint}?activity=1&report_date=5024-05-01')
        assert response.status_code == 400
        assert response.json().get('message') == "No Configuration found for report_date 5024-05-01"

    def test_except_if_no_valid_activity_schema(self):
        response = client.get(f'{pytest.endpoint}?activity=0&report_date=2024-05-01')
        assert response.status_code == 400
        assert response.json().get('message') == "No schema found for activity_id 0 & report_date 2024-05-01"

    def test_except_if_no_valid_source_type_schema(self):
        response = client.get(f'{pytest.endpoint}?activity=1&source_types[]=0&report_date=2024-05-01')
        assert response.status_code == 400
        assert response.json().get('message') == "No schema found for activity_id 1 & source_type_id 0 & report_date 2024-05-01"

    def test_returns_activity_schema(self):
        response = client.get(f'{pytest.endpoint}?activity=1&report_date=2024-05-01')
        assert response.status_code == 200
        assert json.loads(response.json())['schema']['title'] == 'General stationary combustion'
        # No source types passed (and no mandatory single source type). Return only the activity schema
        assert 'sourceTypes' not in json.loads(response.json())['schema']['properties']
        # There are 2 source type options in the general stationary combustion activity schema
        assert len(json.loads(response.json())['schema']['properties'].keys()) == 2

    def test_returns_source_type_schema(self):
        response = client.get(f'{pytest.endpoint}?activity=1&source_types[]=1&report_date=2024-05-01')
        assert response.status_code == 200
        # Source Types object has been created
        assert 'sourceTypes' in json.loads(response.json())['schema']['properties']
        # One source type passed as parameter, one source type schema returned
        assert len(json.loads(response.json())['schema']['properties']['sourceTypes']['properties'].keys()) == 1
        source_type_key = list(json.loads(response.json())['schema']['properties'].keys())[0]
        # Created an array object for units
        assert 'units' in json.loads(response.json())['schema']['properties']['sourceTypes']['properties'][source_type_key]['properties']
        # Created an array object for fuels
        assert 'fuels' in json.loads(response.json())['schema']['properties']['sourceTypes']['properties'][source_type_key]['properties']['units']['items']['properties']
        # Created an array object for emissions
        assert 'emissions' in json.loads(response.json())['schema']['properties']['sourceTypes']['properties'][source_type_key]['properties']['units']['items']['properties']['fuels']['items']['properties']
        # emissions enum has correct gas types
        assert json.loads(response.json())['schema']['properties']['sourceTypes']['properties'][source_type_key]['properties']['units']['items']['properties']['fuels']['items']['properties']['emissions']['items']['properties']['gasType']['enum'] == ['CO2', 'CH4', 'N2O']

    def test_returns_multiple_source_type_schemas(self):
        response = client.get(f'{pytest.endpoint}?activity=1&source_types[]=1&source_types[]=2&report_date=2024-05-01')
        assert response.status_code == 200
        # 2 schemas in the sourceTypes object
        assert len(json.loads(response.json())['schema']['properties']['sourceTypes']['properties'].keys()) == 2
