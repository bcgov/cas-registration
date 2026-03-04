from model_bakery import baker
from unittest.mock import patch, MagicMock
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.utils import custom_reverse_lazy


class TestReportFinalReviewApi(CommonTestSetup):
    def setup_method(self):
        self.report_version = baker.make_recipe("reporting.tests.utils.report_version")
        self.report_operation = baker.make_recipe(
            "reporting.tests.utils.report_operation",
            report_version=self.report_version,
        )
        self.facility_report = baker.make_recipe(
            "reporting.tests.utils.facility_report",
            report_version=self.report_version,
        )
        super().setup_method()
        TestUtils.authorize_current_user_as_operator_user(self, operator=self.report_version.report.operator)

    @patch("service.report_version_service.ReportVersionService.fetch_full_report_version")
    @patch("reporting.schema.report_final_review.ComplianceService.get_calculated_compliance_data")
    @patch("reporting.schema.report_final_review.ReportVersionService.is_initial_report_version")
    def test_get_report_final_review_data_returns_required_data(
        self,
        mock_is_initial: MagicMock,
        mock_compliance: MagicMock,
        mock_fetch: MagicMock,
    ):
        mock_fetch.return_value = self.report_version
        mock_is_initial.return_value = True
        mock_compliance.return_value = None

        response = TestUtils.mock_get_with_auth_role(
            self,
            "industry_user",
            custom_reverse_lazy(
                "get_report_final_review_data",
                kwargs={"version_id": self.report_version.id},
            ),
        )

        assert response.status_code == 200
        mock_fetch.assert_called_once_with(self.report_version.id, prefetch_full_facility_report=False)

        data = response.json()
        assert "report_type" in data
        assert "status" in data
        assert "reporting_year" in data
        assert data["reporting_year"] == self.report_version.report.reporting_year_id
        assert "is_supplementary_report" in data
        assert data["is_supplementary_report"] is False
        assert "facility_reports" in data
        assert "report_operation" in data
        assert data["report_operation"]["operator_legal_name"] == self.report_operation.operator_legal_name
        assert data["report_operation"]["operation_name"] == self.report_operation.operation_name
        assert "activities" in data["report_operation"]
        assert "regulated_products" in data["report_operation"]
        assert "representatives" in data["report_operation"]
        assert "registration_purpose" in data["report_operation"]
        assert "report_person_responsible" in data
        assert "report_additional_data" in data

    def test_get_report_version_facility_report_returns_required_data(self):
        response = TestUtils.mock_get_with_auth_role(
            self,
            "industry_user",
            custom_reverse_lazy(
                "get_report_version_facility_report",
                kwargs={
                    "version_id": self.report_version.id,
                    "facility_id": str(self.facility_report.facility_id),
                },
            ),
        )

        assert response.status_code == 200
        data = response.json()
        assert data["facility_name"] == self.facility_report.facility_name
        assert data["facility_type"] == self.facility_report.facility_type
