from unittest.mock import patch, MagicMock
from model_bakery.baker import make_recipe
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.utils import custom_reverse_lazy
from unittest.mock import AsyncMock


class TestOperationsTimelineEndpoint(CommonTestSetup):
    @patch("service.operation_service_v2.OperationServiceV2.list_operations_timeline", autospec=True)
    def test_returns_data_as_provided_by_the_service(
        self,
        mock_list_operations_timeline: MagicMock | AsyncMock,
    ):
        """
        Testing that the API endpoint fetches the operation timeline data.
        """

        # Arrange: Mock facilities returned by the service
        timeline = make_recipe('utils.operation_designated_operator_timeline', _quantity=2)
        mock_list_operations_timeline.return_value = timeline

        # Act: Mock the authorization and perform the request
        TestUtils.authorize_current_user_as_operator_user(self, operator=make_recipe('utils.operator'))
        response = TestUtils.mock_get_with_auth_role(
            self,
            "industry_user",
            custom_reverse_lazy("list_operations_timeline"),
        )

        # Assert: Verify the response status
        assert response.status_code == 200

        # Assert: Validate the response structure and data
        response_json = response.json()
        assert len(response_json) == 2
        assert response_json.keys() == {'count', 'items'}
        assert sorted(response_json['items'][0].keys()) == sorted(
            [
                'operation__name',
                'operation__type',
                'sfo_facility_id',
                'sfo_facility_name',
                'operation__bcghg_id',
                'operation__bc_obps_regulated_operation',
                'id',
                'operator__legal_name',
                'status',
                'operation__id',
                'operation__status',
            ]
        )
