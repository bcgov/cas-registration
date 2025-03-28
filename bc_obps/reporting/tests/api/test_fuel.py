from registration.tests.utils.helpers import CommonTestSetup, TestUtils

endpoint = "/api/reporting/fuel"


class TestFuelEndpoint(CommonTestSetup):
    def test_invalid_without_fuel_name(self):
        response = TestUtils.mock_get_with_auth_role(self, 'cas_admin', endpoint)
        assert response.status_code == 422

    def test_invalid_fuel(self):
        response = TestUtils.mock_get_with_auth_role(self, 'cas_admin', f'{endpoint}?fuel_name=non-existent')
        assert response.status_code == 404

    def test_returns_fuel_data(self):
        response = TestUtils.mock_get_with_auth_role(self, 'cas_admin', '/api/reporting/fuel?fuel_name=Acetylene')
        assert response.status_code == 200
        assert response.json().get('name') == 'Acetylene'
        assert response.json().get('classification') == 'Exempted Non-biomass'
        assert response.json().get('unit') == 'Sm^3'
