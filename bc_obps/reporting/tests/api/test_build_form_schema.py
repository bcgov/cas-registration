import json
from reporting.models import FuelType
from registration.tests.utils.bakers import operator_baker
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.utils import custom_reverse_lazy
from model_bakery import baker


class TestBuildFormSchema(CommonTestSetup):
    endpoint = custom_reverse_lazy("build_form_schema")

    # PARAMETERS
    def test_invalid_without_version_id(self):
        operator = operator_baker()
        TestUtils.authorize_current_user_as_operator_user(self, operator=operator)

        response = TestUtils.mock_get_with_auth_role(
            self,
            "industry_user",
            f'{self.endpoint}?activity=1',
        )
        assert response.status_code == 422

    def test_invalid_without_activity(self):
        report_version = baker.make_recipe("reporting.tests.utils.report_version", report__reporting_year_id=2024)
        operator = report_version.report.operator
        TestUtils.authorize_current_user_as_operator_user(self, operator=operator)

        response = TestUtils.mock_get_with_auth_role(
            self,
            "industry_user",
            f'{self.endpoint}?report_version_id={report_version.id}',
        )
        assert response.status_code == 422

    # SCHEMAS
    def test_error_if_no_valid_activity_schema(self):
        report_version = baker.make_recipe("reporting.tests.utils.report_version", report__reporting_year_id=2024)
        operator = report_version.report.operator
        TestUtils.authorize_current_user_as_operator_user(self, operator=operator)

        response = TestUtils.mock_get_with_auth_role(
            self,
            "industry_user",
            f'{self.endpoint}?activity=0&report_version_id={report_version.id}',
        )
        assert response.status_code == 404
        assert response.json().get('message') == "Not Found"

    def test_error_if_no_valid_source_type_schema(self):
        report_version = baker.make_recipe("reporting.tests.utils.report_version", report__reporting_year_id=2024)
        operator = report_version.report.operator
        TestUtils.authorize_current_user_as_operator_user(self, operator=operator)

        response = TestUtils.mock_get_with_auth_role(
            self,
            "industry_user",
            f'{self.endpoint}?activity=1&source_types[]=0&report_version_id={report_version.id}',
        )
        assert response.status_code == 404
        assert response.json().get('message') == "Not Found"

    def test_error_if_no_valid_configuration_schema(self):
        report_version = baker.make_recipe("reporting.tests.utils.report_version", report__reporting_year_id=2024)
        operator = report_version.report.operator
        TestUtils.authorize_current_user_as_operator_user(self, operator=operator)

        response = TestUtils.mock_get_with_auth_role(
            self,
            "industry_user",
            f'{self.endpoint}?activity=1&report_version_id=0',
        )
        assert response.status_code == 404
        assert response.json().get('message') == "Not Found"

    def test_returns_activity_schema(self):
        report_version = baker.make_recipe("reporting.tests.utils.report_version", report__reporting_year_id=2024)
        operator = report_version.report.operator
        TestUtils.authorize_current_user_as_operator_user(self, operator=operator)

        response = TestUtils.mock_get_with_auth_role(
            self,
            "industry_user",
            f'{self.endpoint}?activity=1&report_version_id={report_version.id}',
        )
        assert response.status_code == 200
        response_object = json.loads(response.json())
        assert response_object['schema']['title'] == 'General stationary combustion excluding line tracing'
        # No source types passed (and no mandatory single source type). Return only the activity schema
        assert 'sourceTypes' not in response_object['schema']['properties']
        # There are 2 source type options in the general stationary combustion activity schema
        assert len(response_object['schema']['properties'].keys()) == 2

    def test_returns_source_type_schema(self):
        report_version = baker.make_recipe("reporting.tests.utils.report_version", report__reporting_year_id=2024)
        operator = report_version.report.operator
        TestUtils.authorize_current_user_as_operator_user(self, operator=operator)

        response = TestUtils.mock_get_with_auth_role(
            self,
            "industry_user",
            f'{self.endpoint}?activity=1&source_types[]=1&report_version_id={report_version.id}',
        )
        assert response.status_code == 200
        response_object = json.loads(response.json())
        # Source Types object has been created
        assert 'sourceTypes' in response_object['schema']['properties']
        # One source type passed as parameter, one source type schema returned
        assert len(response_object['schema']['properties']['sourceTypes']['properties'].keys()) == 1
        source_type_key = list(response_object['schema']['properties'].keys())[0]
        # Created an array object for units
        assert (
            'units'
            in response_object['schema']['properties']['sourceTypes']['properties'][source_type_key]['properties']
        )
        # Created an array object for fuels
        assert (
            'fuels'
            in response_object['schema']['properties']['sourceTypes']['properties'][source_type_key]['properties'][
                'units'
            ]['items']['properties']
        )
        # Fetched list of fuels & added to enum
        assert (
            len(
                response_object['schema']['properties']['sourceTypes']['properties'][source_type_key]['properties'][
                    'units'
                ]['items']['properties']['fuels']['items']['properties']['fuelType']['properties']['fuelName']['enum']
            )
            == FuelType.objects.count()
        )
        # Created an array object for emissions
        assert (
            'emissions'
            in response_object['schema']['properties']['sourceTypes']['properties'][source_type_key]['properties'][
                'units'
            ]['items']['properties']['fuels']['items']['properties']
        )
        # emissions enum has correct gas types
        assert response_object['schema']['properties']['sourceTypes']['properties'][source_type_key]['properties'][
            'units'
        ]['items']['properties']['fuels']['items']['properties']['emissions']['items']['properties']['gasType'][
            'enum'
        ] == [
            'CO2',
            'CH4',
            'N2O',
        ]

    def test_returns_multiple_source_type_schemas(self):
        report_version = baker.make_recipe("reporting.tests.utils.report_version", report__reporting_year_id=2024)
        operator = report_version.report.operator
        TestUtils.authorize_current_user_as_operator_user(self, operator=operator)

        response = TestUtils.mock_get_with_auth_role(
            self,
            "industry_user",
            f'{self.endpoint}?activity=1&source_types[]=1&source_types[]=2&report_version_id={report_version.id}',
        )
        assert response.status_code == 200
        # 2 schemas in the sourceTypes object
        assert len(json.loads(response.json())['schema']['properties']['sourceTypes']['properties'].keys()) == 2

    def test_single_mandatory_source_type(self):
        report_version = baker.make_recipe("reporting.tests.utils.report_version", report__reporting_year_id=2024)
        operator = report_version.report.operator
        TestUtils.authorize_current_user_as_operator_user(self, operator=operator)

        response = TestUtils.mock_get_with_auth_role(
            self,
            "industry_user",
            f'{self.endpoint}?activity=3&report_version_id={report_version.id}',
        )
        assert response.status_code == 200
        # 1 schema is automatically added to the sourceTypes object when there is only 1 valid sourceType for the activity
        assert len(json.loads(response.json())['schema']['properties']['sourceTypes']['properties'].keys()) == 1

    def test_source_type_schema_no_units(self):
        report_version = baker.make_recipe("reporting.tests.utils.report_version", report__reporting_year_id=2024)
        operator = report_version.report.operator
        TestUtils.authorize_current_user_as_operator_user(self, operator=operator)

        response = TestUtils.mock_get_with_auth_role(
            self,
            "industry_user",
            f'{self.endpoint}?activity=3&report_version_id={report_version.id}',
        )
        assert response.status_code == 200
        response_object = json.loads(response.json())
        source_type_key = list(response_object['schema']['properties']['sourceTypes']['properties'].keys())[0]
        # No units in schema
        assert (
            'units'
            not in response_object['schema']['properties']['sourceTypes']['properties'][source_type_key]['properties']
        )
        # Source Type properties has a child fuel object
        assert (
            'fuels'
            in response_object['schema']['properties']['sourceTypes']['properties'][source_type_key]['properties']
        )

    # Add this test when Alumina Production configs are added
    # def test_source_type_schema_only_emissions(self):
    #     Add test for source type schema shape when there are no units or fuels in the schema
