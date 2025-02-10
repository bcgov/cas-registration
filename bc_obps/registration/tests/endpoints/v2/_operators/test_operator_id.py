from unittest.mock import patch, MagicMock, AsyncMock
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.utils import custom_reverse_lazy
from model_bakery import baker


class TestOperatorIdEndpoint(CommonTestSetup):
    @patch("service.data_access_service.operator_service.OperatorDataAccessService.get_operator_by_id")
    def test_returns_data_as_provided_by_the_service(
        self,
        mock_get_operator: MagicMock | AsyncMock,
    ):
        """
        Testing that the API endpoint fetches the operator for the given ID.
        """

        operator = baker.make_recipe('registration.tests.utils.operator')
        mock_get_operator.return_value = operator
        # Act: Mock the authorization and perform the request
        TestUtils.authorize_current_user_as_operator_user(self, operator=operator)
        response = TestUtils.mock_get_with_auth_role(
            self,
            "industry_user",
            custom_reverse_lazy("get_operator", kwargs={"operator_id": operator.id}),
        )

        # Assert: Verify the response status
        assert response.status_code == 200

        # Assert: Verify the service was called with the correct version ID
        mock_get_operator.assert_called_once_with(operator.id)

        # Assert: Validate the response structure and data
        expected_keys = [
            'id',
            'legal_name',
            'trade_name',
            'business_structure',
            'cra_business_number',
            'bc_corporate_registry_number',
            'mailing_address',
            'street_address',
            'municipality',
            'province',
            'postal_code',
            'parent_operators_array',
            'partner_operators_array',
            'operator_has_parent_operators',
        ]
        assert sorted(response.json().keys()) == sorted(expected_keys)
