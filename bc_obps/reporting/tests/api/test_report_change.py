from model_bakery import baker
from unittest.mock import patch, MagicMock, AsyncMock

from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.utils import custom_reverse_lazy
from reporting.schema.report_change import ReportChangeIn
from reporting.tests.utils.report_access_validation import assert_report_version_ownership_is_validated


class TestReportChangeApi(CommonTestSetup):
    def setup_method(self):
        self.report_version = baker.make_recipe("reporting.tests.utils.report_version")
        super().setup_method()
        TestUtils.authorize_current_user_as_operator_user(self, operator=self.report_version.report.operator)

    """Tests for the get_report_change_by_version_id endpoint."""

    @patch("reporting.service.report_change_service.ReportChangeService.get_report_change_by_version_id")
    def test_get_report_change_by_version_id_returns_expected_data(
        self, mock_get_report_change: MagicMock
    ):
        mock_instance = baker.make_recipe(
            "reporting.tests.utils.report_change",
            report_version=self.report_version,
        )
        mock_get_report_change.return_value = mock_instance

        response = TestUtils.mock_get_with_auth_role(
            self,
            "industry_user",
            custom_reverse_lazy(
                "get_report_change_by_version_id",
                kwargs={"version_id": self.report_version.id},
            ),
        )

        assert response.status_code == 200
        mock_get_report_change.assert_called_once_with(self.report_version.id)

    """Tests for the save_report_change endpoint."""

    @patch("reporting.service.report_change_service.ReportChangeService.save_report_change")
    def test_save_report_change_returns_expected_data(
        self, mock_save_report_change: MagicMock | AsyncMock
    ):
        payload = ReportChangeIn(
            report_version=self.report_version.id,            
            reason_for_change="testing",
        )

        mock_instance = baker.make_recipe(
            "reporting.tests.utils.report_change",
            report_version=self.report_version,
            reason_for_change=payload.reason_for_change,
        )
        mock_save_report_change.return_value = mock_instance

        response = TestUtils.mock_post_with_auth_role(
            self,
            "industry_user",
            self.content_type,
            payload.dict(),
            custom_reverse_lazy(
                "save_report_change",
                kwargs={"version_id": self.report_version.id},
            ),
        )

        assert response.status_code == 200
        response_json = response.json()
        assert response_json["reason_for_change"] == payload.reason_for_change

        mock_save_report_change.assert_called_once_with(self.report_version.id, payload)

    def test_validates_report_version_id(self):
        assert_report_version_ownership_is_validated("get_report_change_by_version_id")
        assert_report_version_ownership_is_validated("save_report_change", method="post")
