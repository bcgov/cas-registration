from registration.tests.utils.bakers import (
    operator_baker,
)
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.utils import custom_reverse_lazy


class TestCurrentUserOperatorEndpoint(CommonTestSetup):
    # GET USER OPERATOR OPERATOR ID 200
    def test_get_current_operator_and_user_operator(self):
        # Act
        operator = operator_baker()
        TestUtils.authorize_current_user_as_operator_user(self, operator=operator)
        response = TestUtils.mock_get_with_auth_role(
            self, "industry_user", custom_reverse_lazy("v1_get_current_operator_and_user_operator")
        )

        response_json = response.json()

        # Assert
        assert response.status_code == 200

        # Additional Assertions
        assert "operator_id" in response_json
        assert "status" in response_json

    # GET USER OPERATOR OPERATOR ID 401
    def test_get_current_operator_and_user_operator_with_invalid_user(self):
        # Act
        response = TestUtils.mock_get_with_auth_role(
            self, "industry_user", custom_reverse_lazy("v1_get_current_operator_and_user_operator")
        )
        # User_operator must be approved to see their operator info
        assert response.status_code == 401
