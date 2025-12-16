from unittest.mock import patch, MagicMock
from model_bakery.baker import make
from model_bakery.baker import make_recipe
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from reporting.models import ReportNonAttributableEmissions, EmissionCategory, GasType
from reporting.tests.utils.report_access_validation import assert_report_version_ownership_is_validated


class TestReportNonAttributableEndpoints(CommonTestSetup):
    def setup_method(self):
        report_version = make_recipe("reporting.tests.utils.report_version")
        self.facility_report = make_recipe("reporting.tests.utils.facility_report", report_version=report_version)
        self.endpoint_under_test = f"/api/reporting/report-version/{self.facility_report.report_version_id}/facilities/{self.facility_report.facility_id}/non-attributable"

        return super().setup_method()

    @patch(
        "reporting.service.report_non_attributable_service.ReportNonAttributableService.get_report_non_attributable_by_version_id"
    )
    def test_get_returns_the_right_data(self, mock_get_emissions: MagicMock):
        TestUtils.authorize_current_user_as_operator_user(
            self, operator=self.facility_report.report_version.report.operator
        )

        emission_category = make(EmissionCategory)
        gas_type = make(GasType)

        mock_emissions = [
            ReportNonAttributableEmissions(
                facility_report=self.facility_report,
                emission_category=emission_category,
                activity="Activity Type",
                source_type="Source Type",
                report_version=self.facility_report.report_version,
            )
        ]

        mock_emissions[0].save()

        mock_emissions[0].gas_type.set([gas_type])

        mock_get_emissions.return_value = mock_emissions

        response = TestUtils.mock_get_with_auth_role(self, "industry_user", self.endpoint_under_test)

        assert response.status_code == 200
        assert response.json() == [
            {
                "id": mock_emissions[0].id,
                "activity": mock_emissions[0].activity,
                "source_type": mock_emissions[0].source_type,
                "emission_category": mock_emissions[0].emission_category.id,
                "gas_type": [gas.id for gas in mock_emissions[0].gas_type.all()],
            }
        ]

    def test_validates_report_version_id(self):
        assert_report_version_ownership_is_validated("get_report_non_attributable_by_version_id", facility_id="uuid")
        assert_report_version_ownership_is_validated("save_report", method="post", facility_id="uuid")
