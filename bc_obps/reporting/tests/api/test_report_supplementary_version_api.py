from model_bakery import baker
from unittest.mock import patch, MagicMock, AsyncMock
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.utils import custom_reverse_lazy
from reporting.tests.utils.report_access_validation import assert_report_version_ownership_is_validated


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
    def test_returns_data_as_provided_by_create_report_supplementary_version(
        self, mock_create_report_supplementary_version: MagicMock | AsyncMock
    ):
        # Arrange: Mock service method return value
        mock_create_report_supplementary_version.return_value = self.new_report_version

        # Act: Authorize user and perform POST request
        endpoint_under_test = "create_report_supplementary_version"
        endpoint_under_test_kwargs = {"version_id": self.old_report_version.id}
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

    @patch("service.report_version_service.ReportVersionService.is_initial_report_version")
    def test_returns_data_as_provided_by_is_initial_version(self, mock_is_initial_report_version: MagicMock):
        # Arrange: If the service returns True (is_initial), then the endpoint should return False.
        is_initial = True
        mock_is_initial_report_version.return_value = is_initial
        expected_response = {"is_supplementary_report_version": not is_initial}  # Expected: False

        # Act: Make GET request to the endpoint.
        endpoint_under_test = "is_supplementary_report_version"
        endpoint_under_test_kwargs = {"version_id": self.old_report_version.id}
        response = TestUtils.mock_get_with_auth_role(
            self,
            "industry_user",
            custom_reverse_lazy(
                endpoint_under_test,
                kwargs=endpoint_under_test_kwargs,
            ),
        )

        # Assert: Check the response status and that the response data matches the expected result.
        assert response.status_code == 200
        assert response.json() == expected_response

        # Verify that the service method was called with the correct report_version_id.
        mock_is_initial_report_version.assert_called_once_with(self.old_report_version.id)

    def test_validates_report_version_id(self):
        assert_report_version_ownership_is_validated("create_report_supplementary_version", method="post")
        assert_report_version_ownership_is_validated("is_supplementary_report_version")
