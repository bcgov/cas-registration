from reporting.models import (
    ConfigurationElement
)
from django.test import Client
import json
import pytest
pytestmark = pytest.mark.django_db
client = Client()
pytest.endpoint = "/api/reporting/build-form-schema"

class TestBuildFormSchema():
    def test_invalid_activity_source_type_pair(self):
        response = client.get(f'{pytest.endpoint}?activity=1')
        assert response.status_code == 400
        assert response.json().get('message') == "ERROR: Cannot build a schema without both Activity & Source Type data"
        response = client.get(f'{pytest.endpoint}?source_type=1')
        assert response.status_code == 400
        assert response.json().get('message') == "ERROR: Cannot build a schema without both Activity & Source Type data"

    def test_invalid_report_date_does_not_return_a_record(self):
        response = client.get(f'{pytest.endpoint}?activity=1&source_type=1&report_date=1800-01-01')
        assert response.status_code == 400
        assert response.json().get('message') == "No base schema found for activity_id 1 & source_type_id 1 & report_date 1800-01-01"

    def test_no_base_schema_found(self):
        response = client.get(f'{pytest.endpoint}?activity=1&source_type=9999')
        assert response.status_code == 400
        assert response.json().get('message') == "No base schema found for activity_id 1 & source_type_id 9999 & report_date 2024-04-01"

    def test_no_base_schema_found(self):
        response = client.get(f'{pytest.endpoint}?activity=1&source_type=9999')
        assert response.status_code == 400
        assert response.json().get('message') == "No base schema found for activity_id 1 & source_type_id 9999 & report_date 2024-04-01"

    def test_no_config_found(self):
        response = client.get(f'{pytest.endpoint}?activity=1&source_type=1&gas_type=1&methodology=9999')
        assert response.status_code == 400
        assert response.json().get('message') == "No configuration found for activity_id 1 & source_type_id 1 & gas_type_id 1 & methodology_id 9999 & report_date 2024-04-01"

    def test_gsc_gas_types(self):
        response = client.get(f'{pytest.endpoint}?activity=1&source_type=1')
        assert response.status_code == 200
        assert json.loads(response.json())['schema']['properties']['gasType']['enum'] == ['CO2', 'CH4', 'N2O']

    def test_gsc_co2_methodologies(self):
        response = client.get(f'{pytest.endpoint}?activity=1&source_type=1&gas_type=1')
        assert response.status_code == 200
        assert json.loads(response.json())['schema']['properties']['methodology']['enum'] == ['Default HHV/Default EF', 'Default EF', 'Measured HHV/Default EF', 'Measured Steam/Default EF', 'Measured CC', 'Measured Steam/Measured EF', 'Alternative Parameter Measurement', 'Replacement Methodology']

    def test_gsc_n2o_methodologies(self):
        response = client.get(f'{pytest.endpoint}?activity=1&source_type=1&gas_type=2')
        assert response.status_code == 200
        assert json.loads(response.json())['schema']['properties']['methodology']['enum'] == ['Default HHV/Default EF', 'Default EF', 'Measured HHV/Default EF', 'Measured EF', 'Measured Steam/Default EF', 'Heat Input/Default EF', 'Alternative Parameter Measurement', 'Replacement Methodology']

    def test_gsc_ch4_methodologies(self):
        response = client.get(f'{pytest.endpoint}?activity=1&source_type=1&gas_type=3')
        assert response.status_code == 200
        assert json.loads(response.json())['schema']['properties']['methodology']['enum'] == ['Default HHV/Default EF', 'Default EF', 'Measured HHV/Default EF', 'Measured EF', 'Measured Steam/Default EF', 'Heat Input/Default EF', 'Alternative Parameter Measurement', 'Replacement Methodology']
