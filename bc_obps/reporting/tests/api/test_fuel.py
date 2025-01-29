from django.test import Client
import pytest

pytestmark = pytest.mark.django_db
client = Client()
pytest.endpoint = "/api/reporting/fuel"


class TestActivityData:
    def test_invalid_without_fuel_name(self):
        response = client.get(f'{pytest.endpoint}')
        assert response.status_code == 422

    def test_invalid_fuel(self):
        response = client.get(f'{pytest.endpoint}?fuel_name=non-existent')
        assert response.status_code == 404

    def test_returns_fuel_data(self):
        response = client.get('/api/reporting/fuel?fuel_name=Acetylene')
        assert response.status_code == 200
        assert response.json().get('name') == 'Acetylene'
        assert response.json().get('classification') == 'Exempted Non-biomass'
        assert response.json().get('unit') == 'Sm^3'
