from model_bakery import baker
from unittest.mock import patch, MagicMock, AsyncMock

from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.utils import custom_reverse_lazy
from reporting.schema.report_additional_data import ReportAdditionalDataIn
from reporting.tests.utils.report_access_validation import assert_report_version_ownership_is_validated


class TestReportAdditionalDataApi(CommonTestSetup):
    def setup_method(self):
        self.report_version = baker.make_recipe("reporting.tests.utils.report_version")
        super().setup_method()
        TestUtils.authorize_current_user_as_operator_user(self, operator=self.report_version.report.operator)

    """Tests for the save_report_additional_data endpoint."""

    @patch("reporting.service.report_additional_data.ReportAdditionalDataService.save_report_additional_data")
    def test_save_report_additional_data_returns_expected_data(
        self, mock_save_report_additional_data: MagicMock | AsyncMock
    ):
        payload = ReportAdditionalDataIn(
            report_version=self.report_version.id,
            capture_emissions=True,
            emissions_on_site_use=100,
            emissions_on_site_sequestration=50,
            emissions_off_site_transfer=25,
            electricity_generated=200,
        )

        mock_instance = baker.make_recipe(
            "reporting.tests.utils.report_additional_data",
            report_version=self.report_version,
            capture_emissions=payload.capture_emissions,
            emissions_on_site_use=payload.emissions_on_site_use,
            emissions_on_site_sequestration=payload.emissions_on_site_sequestration,
            emissions_off_site_transfer=payload.emissions_off_site_transfer,
            electricity_generated=payload.electricity_generated,
        )
        mock_save_report_additional_data.return_value = mock_instance

        response = TestUtils.mock_post_with_auth_role(
            self,
            "industry_user",
            self.content_type,
            payload.dict(),
            custom_reverse_lazy(
                "save_report_additional_data",
                kwargs={"version_id": self.report_version.id},
            ),
        )

        assert response.status_code == 201
        response_json = response.json()
        assert response_json["capture_emissions"] == payload.capture_emissions
        assert response_json["emissions_on_site_use"] == payload.emissions_on_site_use
        assert response_json["emissions_on_site_sequestration"] == payload.emissions_on_site_sequestration
        assert response_json["emissions_off_site_transfer"] == payload.emissions_off_site_transfer
        assert response_json["electricity_generated"] == payload.electricity_generated

        mock_save_report_additional_data.assert_called_once_with(self.report_version.id, payload)

    """Tests for the get_report_additional_data_by_version_id endpoint."""

    @patch("reporting.service.report_additional_data.ReportAdditionalDataService.get_report_report_additional_data")
    def test_get_report_additional_data_by_version_id_returns_expected_data(
        self, mock_get_report_additional_data: MagicMock
    ):
        mock_instance = baker.make_recipe(
            "reporting.tests.utils.report_additional_data",
            report_version=self.report_version,
            capture_emissions=False,
            emissions_on_site_use=150,
            emissions_on_site_sequestration=75,
            emissions_off_site_transfer=35,
            electricity_generated=300,
        )
        mock_get_report_additional_data.return_value = mock_instance

        response = TestUtils.mock_get_with_auth_role(
            self,
            "industry_user",
            custom_reverse_lazy(
                "get_report_additional_data_by_version_id",
                kwargs={"version_id": self.report_version.id},
            ),
        )

        assert response.status_code == 200
        mock_get_report_additional_data.assert_called_once_with(self.report_version.id)

    def test_validates_report_version_id(self):
        assert_report_version_ownership_is_validated("get_report_additional_data_by_version_id")
        assert_report_version_ownership_is_validated("save_report_additional_data", method="post")
