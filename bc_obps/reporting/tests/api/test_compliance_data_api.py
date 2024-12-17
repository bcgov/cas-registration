from model_bakery import baker
from unittest.mock import patch, MagicMock
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.utils import custom_reverse_lazy


class TestComplianceDataApi(CommonTestSetup):
    def setup_method(self):
        self.report_version = baker.make_recipe('reporting.tests.utils.report_version')
        self.mock_emission = 54321.1234
        super().setup_method()
        TestUtils.authorize_current_user_as_operator_user(self, operator=self.report_version.report.operator)

    """Tests for the get_attributable_emissions endpoint."""

    @patch(
        "reporting.service.compliance_service.ComplianceService.get_emissions_attributable_for_reporting", autospec=True
    )
    def test_returns_attributable_emissions(
        self,
        mock_get_attributable_emissions: MagicMock,
    ):
        # Arrange: Mock report version and report verification data
        mock_get_attributable_emissions.return_value = self.mock_emission

        # Act: Authorize user and perform GET request
        response = TestUtils.mock_get_with_auth_role(
            self,
            "industry_user",
            custom_reverse_lazy(
                "get_attributable_emissions",
                kwargs={"report_version_id": self.report_version.id},
            ),
        )

        # Assert: Verify the response status
        assert response.status_code == 200

        # Assert: Verify the service was called with the correct version ID
        mock_get_attributable_emissions.assert_called_once_with(self.report_version.id)

        # Assert: Validate the response  data
        response_json = response.json()

        assert float(response_json) == self.mock_emission
