from uuid import uuid4

from model_bakery import baker
from unittest.mock import patch, MagicMock
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.utils import custom_reverse_lazy


class TestFacilitiesReviewEndpoints(CommonTestSetup):
    def setup_method(self):
        self.report_version = baker.make_recipe('reporting.tests.utils.report_version')
        self.mock_facility_data = {
            "current_facilities": [
                {"facility_id": str(uuid4()), "facility__name": "Facility A", "is_selected": True},
                {"facility_id": str(uuid4()), "facility__name": "Facility B", "is_selected": False},
            ],
            "past_facilities": [
                {"facility_id": str(uuid4()), "facility__name": "Facility C", "is_selected": False},
            ],
            "operation_id": str(uuid4()),
        }
        super().setup_method()
        TestUtils.authorize_current_user_as_operator_user(self, operator=self.report_version.report.operator)

    @patch("reporting.service.report_facilities_service.ReportFacilitiesService.get_all_facilities_for_review")
    def test_get_selected_facilities_success(self, mock_get_all_facilities: MagicMock):
        # Mock the service response
        mock_get_all_facilities.return_value = self.mock_facility_data

        response = TestUtils.mock_get_with_auth_role(
            self,
            "industry_user",
            custom_reverse_lazy(
                "get_selected_facilities",
                kwargs={"report_version_id": self.report_version.id},
            ),
        )
        assert response.status_code == 200
        response_json = response.json()

        assert response_json["current_facilities"] == self.mock_facility_data["current_facilities"]
        assert response_json["past_facilities"] == self.mock_facility_data["past_facilities"]
        assert response_json["operation_id"] == self.mock_facility_data["operation_id"]

    @patch("reporting.service.report_facilities_service.ReportFacilitiesService.save_selected_facilities")
    def test_save_selected_facilities_success(self, mock_save_facilities):
        # Mock the service behavior (doesn't need a return value since it returns None)
        mock_save_facilities.return_value = None

        # Payload
        payload = [str(uuid4()), str(uuid4())]

        response = TestUtils.mock_post_with_auth_role(
            self,
            "industry_user",
            self.content_type,
            payload,
            custom_reverse_lazy(
                "save_selected_facilities",
                kwargs={"report_version_id": self.report_version.id},
            ),
        )
        assert response.status_code == 200
