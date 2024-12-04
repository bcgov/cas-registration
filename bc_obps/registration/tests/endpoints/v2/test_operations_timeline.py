from unittest.mock import patch, MagicMock
from model_bakery.baker import make_recipe
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.utils import custom_reverse_lazy
from unittest.mock import AsyncMock


class TestOperationsTimelineEndpoint(CommonTestSetup):
    @patch("service.operation_service_v2.OperationServiceV2.list_operations_timeline")
    def test_returns_data_as_provided_by_the_service(
        self,
        mock_list_operations_timeline: MagicMock | AsyncMock,
    ):
        """
        Testing that the API endpoint fetches the operation timeline data.
        """

        # Arrange: Mock facilities returned by the service
        mock_list_operations_timeline.return_value = {
            "items": [
                {
                    "operation": {
                        "name": "Alpha Operations",
                        "type": "Processing",
                        "bcghg_id": {"id": "BCGHG67890"},
                        "id": "4f7f236e-4c44-4b52-81d1-b550efc00781",
                    },
                    "sfo_facility_id": "7330c3c4-fb4e-4e4b-8a2b-10e6a85e3224",
                    "sfo_facility_name": "SFO Facility X",
                },
                {
                    "operation": {
                        "name": "Beta Industries",
                        "type": "Distribution",
                        "id": "6c2dc444-1c93-4e18-8029-a15ad5c733d5",
                    },
                },
            ]
        }

        # Act: Mock the authorization and perform the request
        TestUtils.authorize_current_user_as_operator_user(self, operator=make_recipe('utils.operator'))
        response = TestUtils.mock_get_with_auth_role(
            self,
            "industry_user",
            custom_reverse_lazy("list_operations_timeline"),
        )

        # Assert: Verify the response status
        breakpoint()
        assert response.status_code == 200

        # Assert: Validate the response structure and data
        response_json = response.json()
        assert response_json == []
        assert len(response_json) == 2
