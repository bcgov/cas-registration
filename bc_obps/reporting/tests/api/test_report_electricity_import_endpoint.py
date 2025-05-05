from model_bakery import baker
from unittest.mock import patch, MagicMock
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.utils import custom_reverse_lazy
from reporting.schema.report_electricity_import_data import ElectricityImportDataSchema
from reporting.service.report_electricity_import_data_service import ElectricityImportFormData


class TestElectricityImportDataApi(CommonTestSetup):
    def setup_method(self):
        self.report_version = baker.make_recipe("reporting.tests.utils.report_version")
        self.electricity_import_data = baker.make_recipe(
            "reporting.tests.utils.electricity_import_data",
            report_version=self.report_version,
        )
        super().setup_method()
        TestUtils.authorize_current_user_as_operator_user(self, operator=self.report_version.report.operator)

    """Tests for GET electricity import data endpoint."""

    def test_returns_electricity_import_data_for_report_version_id(self):
        url = custom_reverse_lazy(
            "get_electricity_import_data",
            kwargs={"version_id": self.report_version.id},
        )
        response = TestUtils.mock_get_with_auth_role(self, "industry_user", url)

        assert response.status_code == 200
        response_json = response.json()

        assert (
            response_json["import_specified_electricity"] == self.electricity_import_data.import_specified_electricity
        )
        assert response_json["import_specified_emissions"] == self.electricity_import_data.import_specified_emissions
        assert (
            response_json["import_unspecified_electricity"]
            == self.electricity_import_data.import_unspecified_electricity
        )
        assert (
            response_json["import_unspecified_emissions"] == self.electricity_import_data.import_unspecified_emissions
        )
        assert (
            response_json["export_specified_electricity"] == self.electricity_import_data.export_specified_electricity
        )
        assert (
            response_json["export_unspecified_electricity"]
            == self.electricity_import_data.export_unspecified_electricity
        )
        assert (
            response_json["export_unspecified_emissions"] == self.electricity_import_data.export_unspecified_emissions
        )
        assert (
            response_json["canadian_entitlement_electricity"]
            == self.electricity_import_data.canadian_entitlement_electricity
        )
        assert (
            response_json["canadian_entitlement_emissions"]
            == self.electricity_import_data.canadian_entitlement_emissions
        )

    """Tests for POST save electricity import data endpoint."""

    @patch(
        "reporting.service.report_electricity_import_data_service.ElectricityImportDataService.save_electricity_import_data"
    )
    def test_saves_electricity_import_data(self, mock_save_electricity_import_data: MagicMock):
        payload = ElectricityImportDataSchema(
            import_specified_electricity='0.05',
            import_specified_emissions=None,
            import_unspecified_electricity='123456789.123',
            import_unspecified_emissions='0.05',
            export_specified_electricity='0.05',
            export_specified_emissions=55,
            export_unspecified_electricity=None,
            export_unspecified_emissions='0.05',
            canadian_entitlement_electricity='0.05',
            canadian_entitlement_emissions=1000000,
        )

        payload_data = ElectricityImportFormData(**payload.dict())

        mock_save_electricity_import_data.return_value = MagicMock()

        response = TestUtils.mock_post_with_auth_role(
            self,
            "industry_user",
            self.content_type,
            payload.dict(),
            custom_reverse_lazy(
                "save_electricity_import_data",
                kwargs={"version_id": self.report_version.id},
            ),
        )

        assert response.status_code == 200

        mock_save_electricity_import_data.assert_called_once_with(self.report_version.id, payload_data)
