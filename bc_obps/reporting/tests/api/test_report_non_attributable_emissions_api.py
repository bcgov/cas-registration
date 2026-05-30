from unittest.mock import MagicMock, patch
from uuid import uuid4
from model_bakery import baker
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.utils import custom_reverse_lazy
from reporting.tests.utils.report_access_validation import (
    assert_report_version_ownership_is_validated,
)


class TestReportNonAttributableApi(CommonTestSetup):
    def setup_method(self):
        self.report_version = baker.make_recipe("reporting.tests.utils.report_version")
        self.facility = baker.make_recipe("registration.tests.utils.facility")

        super().setup_method()
        TestUtils.authorize_current_user_as_operator_user(
            self,
            operator=self.report_version.report.operator,
        )

    @patch(
        "reporting.service.report_non_attributable_service.ReportNonAttributableService.save_report_non_attributable_emissions"
    )
    def test_saves_report_non_attributable_when_emissions_exceeded(
        self,
        mock_save_report_non_attributable_emissions: MagicMock,
    ):
        payload = {
            "emissions_exceeded": True,
            "activities": [
                {
                    "activity": str(uuid4()),
                    "source_type": str(uuid4()),
                    "emission_category": "Flaring",
                    "gas_type": ["CO2"],
                }
            ],
        }

        mock_save_report_non_attributable_emissions.return_value = []

        response = TestUtils.mock_post_with_auth_role(
            self,
            "industry_user",
            self.content_type,
            payload,
            custom_reverse_lazy(
                "save_report",
                kwargs={
                    "version_id": self.report_version.id,
                    "facility_id": self.facility.id,
                },
            ),
        )

        assert response.status_code == 201
        assert response.json() == []

        mock_save_report_non_attributable_emissions.assert_called_once()

    def test_validates_report_version_id(self):
        assert_report_version_ownership_is_validated(
            "get_report_non_attributable_by_version_id",
            method="get",
            facility_id=self.facility.id,
        )
        assert_report_version_ownership_is_validated(
            "save_report",
            method="post",
            facility_id=self.facility.id,
        )
