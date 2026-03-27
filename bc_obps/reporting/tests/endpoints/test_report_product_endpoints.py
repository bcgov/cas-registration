from unittest.mock import patch, MagicMock
from model_bakery.baker import make_recipe
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from reporting.tests.utils.report_access_validation import assert_report_version_ownership_is_validated


class TestReportProductEndpoints(CommonTestSetup):
    def setup_method(self):
        report_version = make_recipe("reporting.tests.utils.report_version")
        self.facility_report = make_recipe("reporting.tests.utils.facility_report", report_version=report_version)
        self.report_operation = make_recipe("reporting.tests.utils.report_operation", report_version=report_version)

        self.endpoint_under_test = f"/api/reporting/report-version/{self.facility_report.report_version_id}/facilities/{self.facility_report.facility_id}/production-data"
        return super().setup_method()

    @patch("reporting.service.report_product_service.ReportProductService.save_production_data")
    def test_post_calls_the_save_service_with_the_right_data(self, mock_save: MagicMock):
        TestUtils.authorize_current_user_as_operator_user(
            self, operator=self.facility_report.report_version.report.operator
        )

        payload = [
            {
                "product_id": 1234567,
                "annual_production": 1111,
                "production_data_apr_dec": 2222,
                "production_methodology": "method",
            },
        ]

        response = TestUtils.mock_post_with_auth_role(
            self, 'industry_user', 'application/json', payload, self.endpoint_under_test
        )
        assert response.status_code == 200
        mock_save.assert_called_once_with(
            self.facility_report.report_version_id,
            self.facility_report.facility_id,
            [
                {
                    "product_id": 1234567,
                    "annual_production": 1111.0,
                    "production_data_jan_mar": None,
                    "production_data_apr_dec": 2222.0,
                    "production_methodology": "method",
                    "production_methodology_description": None,
                    "quantity_sold_during_period": None,
                    "quantity_throughput_during_period": None,
                    "storage_quantity_end_of_period": None,
                    "storage_quantity_start_of_period": None,
                }
            ],
            self.user.user_guid,
        )

    @patch("reporting.service.report_product_service.ReportProductService.save_production_data")
    def test_post_calls_the_save_service_with_the_right_data_for_jan_mar_production_period(self, mock_save: MagicMock):
        TestUtils.authorize_current_user_as_operator_user(
            self, operator=self.facility_report.report_version.report.operator
        )

        payload = [
            {
                "product_id": 1234567,
                "annual_production": 5678,
                "production_data_jan_mar": 2200,
                "production_methodology": "method",
            },
        ]

        response = TestUtils.mock_post_with_auth_role(
            self, 'industry_user', 'application/json', payload, self.endpoint_under_test
        )
        assert response.status_code == 200
        mock_save.assert_called_once_with(
            self.facility_report.report_version_id,
            self.facility_report.facility_id,
            [
                {
                    "product_id": 1234567,
                    "annual_production": 5678.0,
                    "production_data_jan_mar": 2200.0,
                    "production_data_apr_dec": None,
                    "production_methodology": "method",
                    "production_methodology_description": None,
                    "quantity_sold_during_period": None,
                    "quantity_throughput_during_period": None,
                    "storage_quantity_end_of_period": None,
                    "storage_quantity_start_of_period": None,
                }
            ],
            self.user.user_guid,
        )

    def test_validates_report_version_id(self):
        assert_report_version_ownership_is_validated("save_production_data", method="post", facility_id="uuid")
