from unittest.mock import patch, MagicMock
from model_bakery.baker import make_recipe
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from reporting.schema.report_new_entrant import ReportNewEntrantSchemaIn


class TestReportNewEntrantEndpoints(CommonTestSetup):
    def setup_method(self):
        self.report_version = make_recipe("reporting.tests.utils.report_version")
        self.endpoint_get = f"/api/reporting/report-version/{self.report_version.id}/new-entrant-data"
        self.endpoint_post = f"/api/reporting/report-version/{self.report_version.id}/new-entrant-data"

        return super().setup_method()

    @patch("reporting.service.report_new_entrant_service.ReportNewEntrantService.get_new_entrant_data")
    def test_get_new_entrant_data(self, mock_get_new_entrant_data: MagicMock):
        TestUtils.authorize_current_user_as_operator_user(self, operator=self.report_version.report.operator)

        # Prepare mock data
        mock_new_entrant_data = {
            "products": [
                {"id": 2, "name": "Cement equivalent", "unit": "Tonne cement equivalent", "production_amount": 10}
            ],
            "emissions": [
                {
                    "name": "basic",
                    "title": "Emission categories after new entrant period began",
                    "items": [
                        {"id": 1, "name": "Flaring emissions", "emission": 6},
                        {"id": 2, "name": "Fugitive emissions", "emission": 5},
                    ],
                },
                {
                    "name": "fuel_excluded",
                    "title": "Emissions excluded by fuel type",
                    "items": [{"id": 10, "name": "CO2 emissions from excluded woody biomass", "emission": 5}],
                },
                {
                    "name": "other_excluded",
                    "title": "Other excluded emissions",
                    "items": [
                        {
                            "id": 13,
                            "name": "Emissions from line tracing and non-processing and non-compression activities",
                            "emission": 5,
                        }
                    ],
                },
            ],
            "new_entrant_data": {
                "id": 1,
                "authorization_date": "2024-12-01T16:15:00.070Z",
                "first_shipment_date": "2024-12-01T16:15:01.816Z",
                "new_entrant_period_start": "2024-12-01T16:15:03.750Z",
                "assertion_statement": True,
            },
        }

        mock_get_new_entrant_data.return_value = mock_new_entrant_data

        # Make the GET request
        response = TestUtils.mock_get_with_auth_role(self, "industry_user", self.endpoint_get)

        assert response.status_code == 200
        assert response.json() == mock_new_entrant_data

    @patch("reporting.service.report_new_entrant_service.ReportNewEntrantService.save_new_entrant_data")
    def test_save_new_entrant_data(self, mock_save_new_entrant_data: MagicMock):
        report_version_mock = make_recipe("reporting.tests.utils.report_version")
        TestUtils.authorize_current_user_as_operator_user(self, operator=report_version_mock.report.operator)

        # Prepare the payload for the POST request
        payload = ReportNewEntrantSchemaIn(
            products=[],
            emissions=[],
            authorization_date="1234",
            first_shipment_date="1234",
            new_entrant_period_start="1234",
            assertion_statement=True,
        )

        # Make the POST request
        response = TestUtils.mock_post_with_auth_role(
            self, "industry_user", endpoint=self.endpoint_post, content_type=self.content_type, data=payload.dict()
        )

        # Check that the status code is 200 and mock method is called
        assert response.status_code == 200
        mock_save_new_entrant_data.assert_called_once_with(self.report_version.id, payload)
