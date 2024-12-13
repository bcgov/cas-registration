from unittest.mock import patch, MagicMock, AsyncMock
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.utils import custom_reverse_lazy
from model_bakery import baker


class TestOperatorIdConfirmEndpoint(CommonTestSetup):
    @patch("service.data_access_service.operator_service.OperatorDataAccessService.get_operator_by_id")
    def test_returns_data_as_provided_by_the_service(
        self,
        mock_get_operator_confirm: MagicMock | AsyncMock,
    ):
        """
        Testing that the API endpoint fetches the operator for the given ID.
        """

        operator = baker.make_recipe('utils.operator')
        mock_get_operator_confirm.return_value = operator
        response = TestUtils.mock_get_with_auth_role(
            self,
            "industry_user",
            custom_reverse_lazy("get_operator_confirm", kwargs={"operator_id": operator.id}),
        )

        # Assert: Verify the response status
        assert response.status_code == 200

        # Assert: Verify the service was called with the correct version ID
        mock_get_operator_confirm.assert_called_once_with(operator.id)

        # Assert: Validate the response structure and data
        expected_keys = ["id", "legal_name", "trade_name", "cra_business_number", "street_address"]
        assert sorted(response.json().keys()) == sorted(expected_keys)
