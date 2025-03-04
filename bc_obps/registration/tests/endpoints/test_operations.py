from registration.tests.constants import MOCK_DATA_URL
from model_bakery import baker
from localflavor.ca.models import CAPostalCodeField
from registration.tests.utils.helpers import CommonTestSetup, TestUtils

from registration.utils import custom_reverse_lazy
from registration.models import Operation
from unittest.mock import patch, MagicMock
from model_bakery.baker import make_recipe

baker.generators.add(CAPostalCodeField, TestUtils.mock_postal_code)

fake_timestamp_from_past = '2024-01-09 14:13:08.888903-0800'
fake_timestamp_from_past_str_format = '%Y-%m-%d %H:%M:%S.%f%z'


class TestOperationsEndpoint(CommonTestSetup):
    @patch("service.operation_service_v2.OperationServiceV2.list_operations_timeline", autospec=True)
    def test_returns_data_as_provided_by_the_service(self, mock_list_operations_timeline: MagicMock):
        """
        Testing that the API endpoint fetches the operation timeline data.
        """

        # Arrange: Mock facilities returned by the service
        timeline = make_recipe('registration.tests.utils.operation_designated_operator_timeline', _quantity=2)
        mock_list_operations_timeline.return_value = timeline

        # Act: Mock the authorization and perform the request
        TestUtils.authorize_current_user_as_operator_user(
            self, operator=make_recipe('registration.tests.utils.operator')
        )
        response = TestUtils.mock_get_with_auth_role(
            self,
            "industry_user",
            custom_reverse_lazy("list_operations"),
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
                'operation__registration_purpose',
                'id',
                'operator__legal_name',
                'status',
                'operation__id',
                'operation__status',
            ]
        )


class TestPostOperationsEndpoint(CommonTestSetup):
    mock_payload = {
        "registration_purpose": "Reporting Operation",
        "regulated_products": [1],
        "name": "op name",
        "type": Operation.Types.SFO,
        "naics_code_id": 1,
        "secondary_naics_code_id": 2,
        "tertiary_naics_code_id": 3,
        "activities": [1],
        "boundary_map": MOCK_DATA_URL,
        "process_flow_diagram": MOCK_DATA_URL,
    }

    # GET
    def test_user_can_post_operation_success(self):
        baker.make_recipe('registration.tests.utils.approved_user_operator', user=self.user)
        response = TestUtils.mock_post_with_auth_role(
            self,
            "industry_user",
            self.content_type,
            self.mock_payload,
            custom_reverse_lazy("register_create_operation_information"),
        )

        assert response.status_code == 201
        assert response.json().get('name') == "op name"
        assert response.json().get('id') is not None
