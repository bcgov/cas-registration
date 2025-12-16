import json
from types import SimpleNamespace
from unittest.mock import ANY, patch, MagicMock
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from model_bakery.baker import make_recipe

from registration.utils import custom_reverse_lazy
from reporting.tests.utils.report_access_validation import assert_report_version_ownership_is_validated


class TestReportActivityEndpoint(CommonTestSetup):
    """Tests for the report activity endpoint"""

    def setup_method(self):
        """Set up before each test"""
        super().setup_method()

        # Create basic test data
        self.facility_report = make_recipe(
            'reporting.tests.utils.facility_report',
            report_version__report__reporting_year_id=2025,
        )
        self.activity = make_recipe('reporting.tests.utils.activity')

        # Create endpoint
        self.endpoint = custom_reverse_lazy(
            "save_report_activity_data",
            kwargs={
                "version_id": self.facility_report.report_version.id,
                "facility_id": self.facility_report.facility.id,
                "activity_id": self.activity.id,
            },
        )

        # Create test payload
        self.test_payload = {"activity_data": {"test_data": "1"}}

        # Store operator for authorization
        self.operator = self.facility_report.report_version.report.operator

    def _make_request(self, role, authorize_operator=True):
        """Helper method to make a request with given role"""
        if authorize_operator:
            TestUtils.authorize_current_user_as_operator_user(self, operator=self.operator)

        return TestUtils.mock_post_with_auth_role(
            self,
            role,
            content_type=self.content_type,
            data=json.dumps(self.test_payload),
            endpoint=self.endpoint,
        )

    # SERVICE OUTPUT
    @patch("reporting.api.report_activity.load_report_activity_data")
    @patch("reporting.service.report_activity_save_service.ReportActivitySaveService.save")
    def test_post_saves_then_calls_the_load_function(self, mock_service_save: MagicMock, mock_load_endpoint: MagicMock):
        """Test that the endpoint returns the service's output correctly"""
        # Arrange
        mock_service_save.return_value = SimpleNamespace(id=12345)
        mock_load_endpoint.return_value = (200, {"loaded_saved_data": True})

        # Act
        response = self._make_request("industry_user")

        # Assert

        mock_service_save.assert_called_once_with({"test_data": "1"})
        mock_load_endpoint.assert_called_once_with(
            ANY, self.facility_report.report_version.id, self.facility_report.facility.id, self.activity.id
        )

        assert response.status_code == 200
        assert response.json() == {'loaded_saved_data': True}

    @patch("reporting.service.report_activity_load_service.ReportActivityLoadService.load")
    def test_get_returns_the_serialized_value_from_the_serializer(self, mock_service: MagicMock):

        facility_report = make_recipe('reporting.tests.utils.facility_report')
        activity = make_recipe('reporting.tests.utils.activity')

        endpoint_under_test = (
            f"/api/reporting/report-version/{facility_report.report_version.id}"
            + f"/facilities/{facility_report.facility.id}"
            + f"/activity/{activity.id}/report-activity"
        )

        TestUtils.authorize_current_user_as_operator_user(self, operator=facility_report.report_version.report.operator)

        mock_service.return_value = {"serialized!": True}

        response = TestUtils.mock_get_with_auth_role(self, "industry_user", endpoint_under_test)

        assert response.json() == {"serialized!": True}
        assert response.status_code == 200
        mock_service.assert_called_once()

    def test_sets_and_returns_json_data_from_the_db(self):

        report_version = make_recipe("reporting.tests.utils.report_version")

        # let's get cooking
        report_emission = make_recipe(
            "reporting.tests.utils.report_emission",
            report_methodology__report_version=report_version,
            report_methodology__methodology__name="Test Method",
            report_methodology__json_data={"method_prop": True},
            report_version=report_version,
            gas_type__chemical_formula="CaS",
            json_data={"emission_prop": "emission!", "emission": 123},
            report_fuel__report_version=report_version,
            report_fuel__fuel_type__classification="fuel class",
            report_fuel__fuel_type__name="fuel name",
            report_fuel__fuel_type__unit="fuel unit",
            report_fuel__json_data={"fuel_prop": "fuel!"},
            report_fuel__report_unit__report_version=report_version,
            report_fuel__report_unit__json_data={"unit_prop": "unit!"},
            report_fuel__report_unit__report_source_type__report_version=report_version,
            report_fuel__report_unit__report_source_type__json_data={"source_type_prop": "source type!"},
            report_fuel__report_unit__report_source_type__source_type__json_key="testfueltypekey",
            report_fuel__report_unit__report_source_type__report_activity__report_version=report_version,
            report_fuel__report_unit__report_source_type__report_activity__json_data={"activity_prop": "activity!"},
            report_fuel__report_unit__report_source_type__report_activity__facility_report__report_version=report_version,
        )

        endpoint_under_test = (
            f"/api/reporting/report-version/{report_emission.report_version.id}"
            + f"/facilities/{report_emission.report_fuel.report_unit.report_source_type.report_activity.facility_report.facility.id}"
            + f"/activity/{report_emission.report_fuel.report_unit.report_source_type.report_activity.activity.id}/report-activity"
        )

        TestUtils.authorize_current_user_as_operator_user(
            self,
            operator=report_emission.report_fuel.report_unit.report_source_type.report_activity.facility_report.report_version.report.operator,
        )
        response = TestUtils.mock_get_with_auth_role(self, "industry_user", endpoint_under_test)

        assert response.json() == {
            "activity_prop": "activity!",
            "id": report_emission.report_fuel.report_unit.report_source_type.report_activity.id,
            "sourceTypes": {
                "testfueltypekey": {
                    "source_type_prop": "source type!",
                    "id": report_emission.report_fuel.report_unit.report_source_type.id,
                    "units": [
                        {
                            "unit_prop": "unit!",
                            "id": report_emission.report_fuel.report_unit.id,
                            "fuels": [
                                {
                                    "fuel_prop": "fuel!",
                                    "id": report_emission.report_fuel.id,
                                    "fuelType": {
                                        "fuelName": "fuel name",
                                        "fuelUnit": "fuel unit",
                                        "fuelClassification": "fuel class",
                                    },
                                    "emissions": [
                                        {
                                            "emission_prop": "emission!",
                                            "emission": 123,
                                            "id": report_emission.id,
                                            "gasType": "CaS",
                                            "methodology": {
                                                "id": report_emission.report_methodology.id,
                                                "methodology": "Test Method",
                                                "method_prop": True,
                                            },
                                        }
                                    ],
                                }
                            ],
                        }
                    ],
                }
            },
        }

    def test_validates_report_version_id(self):
        assert_report_version_ownership_is_validated("load_report_activity_data", facility_id="uuid", activity_id=0)
        assert_report_version_ownership_is_validated(
            "save_report_activity_data",
            method="post",
            facility_id="uuid",
            activity_id=0,
        )
