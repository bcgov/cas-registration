from unittest.mock import patch, MagicMock
from model_bakery import baker
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.utils import custom_reverse_lazy
from reporting.tests.utils.report_access_validation import assert_report_version_ownership_is_validated


class TestReportSupplementaryApi(CommonTestSetup):
    def setup_method(self):
        super().setup_method()
        self.approved_user_operator = baker.make_recipe(
            "registration.tests.utils.approved_user_operator", user=self.user
        )
        self.old_report_version = baker.make_recipe(
            "reporting.tests.utils.report_version", report__operation__operator=self.approved_user_operator.operator
        )
        self.new_report_version = baker.make_recipe("reporting.tests.utils.report_version")
        TestUtils.authorize_current_user_as_operator_user(self, operator=self.old_report_version.report.operator)

    @patch(
        "reporting.service.report_supplementary_version_service.ReportSupplementaryVersionService"
        ".create_or_clone_report_version"
    )
    def test_create_or_clone_report_version_is_called(
        self,
        mock_create_or_clone: MagicMock,
    ):
        """Test that create_or_clone_report_version is called with the correct version ID."""
        report_version = self.old_report_version
        mock_create_or_clone.return_value = self.new_report_version

        response = TestUtils.mock_post_with_auth_role(
            self,
            "industry_user",
            self.content_type,
            {},
            custom_reverse_lazy(
                "create_report_supplementary_version",
                kwargs={"version_id": report_version.id},
            ),
        )

        assert response.status_code == 201
        assert response.json() == self.new_report_version.id
        mock_create_or_clone.assert_called_once_with(report_version.id)

    @patch("service.report_version_service.ReportVersionService.is_initial_report_version")
    def test_returns_data_as_provided_by_is_initial_version(self, mock_is_initial_report_version: MagicMock):
        is_initial = True
        mock_is_initial_report_version.return_value = is_initial
        expected_response = not is_initial  # Expected: False

        response = TestUtils.mock_get_with_auth_role(
            self,
            "industry_user",
            custom_reverse_lazy(
                "is_supplementary_report_version",
                kwargs={"version_id": self.old_report_version.id},
            ),
        )

        assert response.status_code == 200
        assert response.json() == expected_response
        mock_is_initial_report_version.assert_called_once_with(self.old_report_version.id)

    def test_validates_report_version_id(self):
        assert_report_version_ownership_is_validated("create_report_supplementary_version", method="post")
        assert_report_version_ownership_is_validated("is_supplementary_report_version")
