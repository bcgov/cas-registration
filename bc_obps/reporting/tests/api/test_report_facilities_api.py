from unittest.mock import patch, MagicMock, AsyncMock
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.utils import custom_reverse_lazy
from reporting.tests.utils.bakers import report_version_baker
from reporting.tests.utils.report_access_validation import assert_report_version_ownership_is_validated


class TestReportFacilityListEndpoint(CommonTestSetup):
    @patch("reporting.service.report_facilities_service.ReportFacilitiesService.get_report_facility_list_by_version_id")
    def test_returns_data_as_provided_by_the_service(
        self,
        mock_get_facility_list: MagicMock | AsyncMock,
    ):
        """
        Testing that the API endpoint fetches the facility list for the given report version ID.
        """

        # Arrange: Mock facilities returned by the service
        facilities = ["Facility 1", "Facility 2"]
        mock_get_facility_list.return_value = {"facilities": facilities}

        # Act: Mock the authorization and perform the request
        report_version = report_version_baker()
        TestUtils.authorize_current_user_as_operator_user(self, operator=report_version.report.operator)
        response = TestUtils.mock_get_with_auth_role(
            self,
            "industry_user",
            custom_reverse_lazy("get_report_facility_list_by_version_id", kwargs={"version_id": report_version.id}),
        )

        # Assert: Verify the response status
        assert response.status_code == 200

        # Assert: Verify the service was called with the correct version ID
        mock_get_facility_list.assert_called_once_with(report_version.id)

        # Assert: Validate the response structure and data
        response_json = response.json()
        assert response_json["facilities"] == facilities
        assert len(response_json["facilities"]) == 2
        assert response_json["facilities"][0] == "Facility 1"
        assert response_json["facilities"][1] == "Facility 2"

    def test_validates_report_version_id(self):
        assert_report_version_ownership_is_validated("get_report_facility_list_by_version_id")
