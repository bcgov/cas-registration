from registration.models.user_operator import UserOperator
from registration.tests.utils.bakers import (
    operator_baker,
    user_operator_baker,
)
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.utils import custom_reverse_lazy


class TestCurrentUserOperatorV2Endpoint(CommonTestSetup):
    def test_current_endpoint_unauthorized_roles_cannot_get(self):
        # cas users can't get
        response = TestUtils.mock_get_with_auth_role(
            self, "cas_pending", custom_reverse_lazy("get_current_operator_and_user_operator_v2")
        )
        assert response.status_code == 401
        response = TestUtils.mock_get_with_auth_role(
            self, "cas_analyst", custom_reverse_lazy("get_current_operator_and_user_operator_v2")
        )
        assert response.status_code == 401
        response = TestUtils.mock_get_with_auth_role(
            self, "cas_admin", custom_reverse_lazy("get_current_operator_and_user_operator_v2")
        )
        assert response.status_code == 401

        # unapproved industry users can't get
        user_operator_instance = user_operator_baker(
            {
                'status': UserOperator.Statuses.PENDING,
            }
        )
        user_operator_instance.user_id = self.user.user_guid
        user_operator_instance.save()

        response = TestUtils.mock_get_with_auth_role(
            self,
            "industry_user",
            custom_reverse_lazy('get_current_operator_and_user_operator_v2'),
        )
        assert response.status_code == 401

    # GET USER OPERATOR OPERATOR ID 200
    def test_get_current_operator_and_user_operator(self):
        # Act
        operator = operator_baker()
        TestUtils.authorize_current_user_as_operator_user(self, operator=operator)
        response = TestUtils.mock_get_with_auth_role(
            self, "industry_user", custom_reverse_lazy("get_current_operator_and_user_operator_v2")
        )

        response_json = response.json()

        # Assert
        assert response.status_code == 200

        # Additional Assertions
        assert response_json['id'] == str(operator.id)
        assert "trade_name" in response_json
        assert "street_address" in response_json
        assert "municipality" in response_json
        assert "province" in response_json
        assert "postal_code" in response_json
        assert "operator_has_parent_operators" in response_json
        assert "parent_operators_array" in response_json
        assert "partner_operators_array" in response_json

    # GET USER OPERATOR OPERATOR ID 401
    def test_get_current_operator_and_user_operator_with_invalid_user(self):
        # Act
        response = TestUtils.mock_get_with_auth_role(
            self, "industry_user", custom_reverse_lazy("get_current_operator_and_user_operator_v2")
        )
        # User_operator must be approved to see their operator info
        assert response.status_code == 401

    # PUT
    def test_current_endpoint_unauthorized_roles_cannot_put(self):

        for role in ["cas_pending", "cas_analyst", "cas_admin", "industry_user"]:
            # cas users and unapproved industry_user can't put
            response = TestUtils.mock_put_with_auth_role(
                self,
                role,
                self.content_type,
                {
                    "street_address": "123 Main St",
                    "municipality": "City",
                    "province": "ON",
                    "postal_code": "A1B 2C3",
                    "id": "4242ea9d-b917-4129-93c2-db00b7451051",
                    "legal_name": "khg",
                    "trade_name": "Existing Operator 2 Trade Name",
                    "cra_business_number": 987654321,
                    "bc_corporate_registry_number": "def1234567",
                    "business_structure": "BC Corporation",
                },
                custom_reverse_lazy("update_operator_and_user_operator"),
            )
            assert response.status_code == 401

    def test_put_current_user_operator(self):
        # Act
        operator = operator_baker()
        TestUtils.authorize_current_user_as_operator_user(self, operator=operator)
        response = TestUtils.mock_put_with_auth_role(
            self,
            "industry_user",
            self.content_type,
            {
                "street_address": "123 Main St",
                "municipality": "City",
                "province": "ON",
                "postal_code": "A1B 2C3",
                "id": "4242ea9d-b917-4129-93c2-db00b7451051",
                "legal_name": "khg",
                "trade_name": "Existing Operator 2 Trade Name",
                "cra_business_number": 987654321,
                "bc_corporate_registry_number": "def1234567",
                "business_structure": "BC Corporation",
            },
            custom_reverse_lazy("update_operator_and_user_operator"),
        )

        response_json = response.json()

        # Assert
        assert response.status_code == 200

        # Additional Assertions
        assert response_json['id'] == str(operator.id)
        assert response_json["trade_name"] == operator.trade_name
        assert response_json["street_address"] == operator.street_address
        assert response_json["municipality"] == operator.municipality
        assert response_json["province"] == operator.province
        assert response_json["postal_code"] == operator.postal_code
        assert response_json["operator_has_parent_operators"] == operator.operator_has_parent_operators
        assert response_json["parent_operators_array"] == operator.parent_operators
        assert response_json["partner_operators_array"] == operator.partner_operators
