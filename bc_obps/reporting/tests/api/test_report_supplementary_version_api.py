from model_bakery import baker
from unittest.mock import patch, MagicMock, AsyncMock
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.utils import custom_reverse_lazy


class TestReportSupplementaryApi(CommonTestSetup):
    def setup_method(self):
        # Create ReportVersion instances
        self.old_report_version = baker.make_recipe("reporting.tests.utils.report_version")
        self.new_report_version = baker.make_recipe("reporting.tests.utils.report_version")

        # Call parent setup and authorize user
        super().setup_method()
        TestUtils.authorize_current_user_as_operator_user(self, operator=self.old_report_version.report.operator)

    @patch(
        "reporting.service.report_supplementary_version_service.ReportSupplementaryVersionService.create_report_supplementary_version"
    )
    def test_returns_data_as_provided_by_the_service(
        self, mock_create_report_supplementary_version: MagicMock | AsyncMock
    ):
        # Arrange: Mock service method return value
        mock_create_report_supplementary_version.return_value = self.new_report_version

        # Act: Authorize user and perform POST request
        endpoint_under_test = "create_report_supplementary_version"
        endpoint_under_test_kwargs = {"report_version_id": self.old_report_version.id}
        response = TestUtils.mock_post_with_auth_role(
            self,
            "industry_user",
            self.content_type,
            {},  # No request payload expected
            custom_reverse_lazy(
                endpoint_under_test,
                kwargs=endpoint_under_test_kwargs,
            ),
        )

        # Assert: Check the response status and content
        assert response.status_code == 201
        assert response.json() == self.new_report_version.id

        # Assert: Ensure the service method was called with the correct version_id
        mock_create_report_supplementary_version.assert_called_once_with(self.old_report_version.id)