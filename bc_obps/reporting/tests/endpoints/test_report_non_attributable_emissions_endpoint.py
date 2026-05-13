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

        record = ReportNonAttributableEmissions(
            facility_report=self.facility_report,
            emission_category=emission_category,
            activity="Activity Type",
            source_type="Source Type",
            report_version=self.facility_report.report_version,
        )
        record.save()
        record.gas_type.set([gas_type])

        mock_qs = MagicMock()
        mock_qs.exists.return_value = True
        mock_qs.__iter__ = MagicMock(return_value=iter([record]))
        mock_get_emissions.return_value = mock_qs

        response = TestUtils.mock_get_with_auth_role(self, "industry_user", self.endpoint_under_test)

        assert response.status_code == 200
        assert response.json() == {
            "emissions_exceeded": True,
            "activities": [
                {
                    "id": record.id,
                    "activity": record.activity,
                    "source_type": record.source_type,
                    "emission_category": emission_category.category_name,
                    "gas_type": [gas_type.chemical_formula],
                }
            ],
        }

    def test_post_with_emissions_not_exceeded_ignores_activities(self):
        TestUtils.authorize_current_user_as_operator_user(
            self, operator=self.facility_report.report_version.report.operator
        )
        payload = {
            "emissions_exceeded": False,
            "activities": [{"gas_type": []}],  # incomplete item — should be cleared by schema
        }
        response = TestUtils.mock_post_with_auth_role(
            self, "industry_user", "application/json", payload, self.endpoint_under_test
        )
        assert response.status_code == 201
        assert response.json() == []

    def test_post_with_emissions_exceeded_and_no_activities_returns_400(self):
        TestUtils.authorize_current_user_as_operator_user(
            self, operator=self.facility_report.report_version.report.operator
        )
        payload = {"emissions_exceeded": True, "activities": []}
        response = TestUtils.mock_post_with_auth_role(
            self, "industry_user", "application/json", payload, self.endpoint_under_test
        )
        assert response.status_code == 400

    def test_validates_report_version_id(self):
        assert_report_version_ownership_is_validated("get_report_non_attributable_by_version_id", facility_id="uuid")
        assert_report_version_ownership_is_validated("save_report", method="post", facility_id="uuid")
