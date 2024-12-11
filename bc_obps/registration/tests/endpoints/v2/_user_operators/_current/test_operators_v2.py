from registration.tests.utils.bakers import operator_baker
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.utils import custom_reverse_lazy


class TestCurrentUserOperatorV2Endpoint(CommonTestSetup):

    # GET USER OPERATOR OPERATOR ID 200
    def test_get_current_operator_and_user_operator(self):
        # Act
        operator = operator_baker()
        TestUtils.authorize_current_user_as_operator_user(self, operator=operator)
        response = TestUtils.mock_get_with_auth_role(
            self, "industry_user", custom_reverse_lazy("get_current_operator_and_user_operator")
        )

        response_json = response.json()

        # Assert
        assert response.status_code == 200

        # Additional Assertions
        assert response_json['id'] == str(operator.id)
        assert "street_address" in response_json
        assert "municipality" in response_json
        assert "province" in response_json
        assert "postal_code" in response_json
        # brianna
        assert "operator_has_parent_operators" in response_json

    # GET USER OPERATOR OPERATOR ID 401
    def test_get_current_operator_and_user_operator_with_invalid_user(self):
        # Act
        response = TestUtils.mock_get_with_auth_role(
            self, "industry_user", custom_reverse_lazy("get_current_operator_and_user_operator")
        )
        # User_operator must be approved to see their operator info
        assert response.status_code == 401

    # PUT
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
        operator.refresh_from_db()  # Refresh the operator object to get the updated values

        # Additional Assertions
        assert response_json['id'] == str(operator.id)
        assert response_json["legal_name"] == operator.legal_name
        assert response_json["trade_name"] == operator.trade_name

        assert response_json["cra_business_number"] == operator.cra_business_number
        assert response_json["bc_corporate_registry_number"] == operator.bc_corporate_registry_number
        assert response_json["business_structure"] == operator.business_structure.name
        assert response_json["street_address"] == operator.mailing_address.street_address
        assert response_json["municipality"] == operator.mailing_address.municipality
        assert response_json["province"] == operator.mailing_address.province
        assert response_json["postal_code"] == operator.mailing_address.postal_code
