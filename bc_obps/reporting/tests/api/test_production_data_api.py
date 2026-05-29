from unittest.mock import MagicMock, patch
from model_bakery import baker
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.utils import custom_reverse_lazy
from reporting.tests.utils.report_access_validation import (
    assert_report_version_ownership_is_validated,
)


class TestProductionDataApi(CommonTestSetup):
    def setup_method(self):
        self.report_version = baker.make_recipe("reporting.tests.utils.report_version")
        self.facility = baker.make_recipe("registration.tests.utils.facility")

        super().setup_method()

        TestUtils.authorize_current_user_as_operator_user(
            self,
            operator=self.report_version.report.operator,
        )

    @patch("reporting.api.production_data.ReportProductService.save_production_data")
    def test_save_production_data_returns_200(
        self,
        mock_save_production_data: MagicMock,
    ):
        payload = [
            {
                "product_id": 1,
                "annual_production": 100,
                "production_data_jan_mar": 25,
                "production_data_apr_dec": 75,
                "production_methodology": "other",
                "production_methodology_description": "test methodology",
            }
        ]

        response = TestUtils.mock_post_with_auth_role(
            self,
            "industry_user",
            self.content_type,
            payload,
            custom_reverse_lazy(
                "save_production_data",
                kwargs={
                    "version_id": self.report_version.id,
                    "facility_id": self.facility.id,
                },
            ),
        )

        assert response.status_code == 200
        assert response.json() == 200

        mock_save_production_data.assert_called_once()

    @patch("reporting.api.production_data.ReportProductService.save_production_data")
    def test_save_production_data_returns_error_when_facility_report_not_found(
        self,
        mock_save_production_data: MagicMock,
    ):
        mock_save_production_data.side_effect = baker.make_recipe("reporting.tests.utils.facility_report").DoesNotExist(
            "FacilityReport matching query does not exist."
        )

        payload = [
            {
                "product_id": 1,
                "annual_production": 100,
                "production_data_jan_mar": 25,
                "production_data_apr_dec": 75,
                "production_methodology": "other",
                "production_methodology_description": "test methodology",
            }
        ]

        response = TestUtils.mock_post_with_auth_role(
            self,
            "industry_user",
            self.content_type,
            payload,
            custom_reverse_lazy(
                "save_production_data",
                kwargs={
                    "version_id": self.report_version.id,
                    "facility_id": self.facility.id,
                },
            ),
        )

        assert response.status_code == 404

        response_json = response.json()
        assert response_json["message"] == "Not Found"
        assert response_json["errors"][0]["key"] == "generic_error"
        assert response_json["errors"][0]["error"]["message"] == "Not Found"

    def test_validates_report_version_id(self):
        assert_report_version_ownership_is_validated(
            "save_production_data",
            method="post",
        )
