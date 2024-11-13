from model_bakery import baker
from registration.models import (
    UserOperator,
)
from registration.tests.constants import MOCK_DATA_URL
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.tests.utils.bakers import operation_baker, operator_baker
from registration.utils import custom_reverse_lazy
import json


class TestOperationIdEndpoint(CommonTestSetup):
    endpoint = CommonTestSetup.base_endpoint + "operations"

    test_payload = {
        "registration_purpose": "Reporting Operation",
        "regulated_products": [1],
        "name": "op name",
        "type": "SFO",
        "naics_code_id": 1,
        "secondary_naics_code_id": 2,
        "tertiary_naics_code_id": 3,
        "activities": [1],
        "boundary_map": MOCK_DATA_URL,
        "process_flow_diagram": MOCK_DATA_URL,
    }

    def test_industry_users_can_only_get_their_own_operations(self):
        random_operator = operator_baker()
        the_users_operator = operator_baker()
        user_operator = baker.make(
            UserOperator,
            user_id=self.user.user_guid,
            status=UserOperator.Statuses.APPROVED,
            operator=the_users_operator,
        )

        random_operation = operation_baker(random_operator.id)
        users_operation = operation_baker(user_operator.operator.id)

        response_1 = TestUtils.mock_get_with_auth_role(
            self, "industry_user", custom_reverse_lazy("get_operation_v2", kwargs={"operation_id": users_operation.id})
        )

        assert response_1.status_code == 200

        response_2 = TestUtils.mock_get_with_auth_role(
            self, "industry_user", custom_reverse_lazy("get_operation_v2", kwargs={"operation_id": random_operation.id})
        )
        assert response_2.status_code == 401

    def test_industry_users_can_only_get_their_own_operations_with_documents(self):
        random_operator = operator_baker()
        the_users_operator = operator_baker()
        user_operator = baker.make(
            UserOperator,
            user_id=self.user.user_guid,
            status=UserOperator.Statuses.APPROVED,
            operator=the_users_operator,
        )

        random_operation = operation_baker(random_operator.id)
        users_operation = operation_baker(user_operator.operator.id)

        response_1 = TestUtils.mock_get_with_auth_role(
            self,
            "industry_user",
            custom_reverse_lazy("get_operation_with_documents", kwargs={"operation_id": users_operation.id}),
        )

        assert response_1.status_code == 200

        response_2 = TestUtils.mock_get_with_auth_role(
            self,
            "industry_user",
            custom_reverse_lazy("get_operation_with_documents", kwargs={"operation_id": random_operation.id}),
        )
        assert response_2.status_code == 401

    def test_operations_endpoint_get_success(self):
        approved_user_operator = baker.make_recipe('utils.approved_user_operator', user=self.user)
        operation = baker.make_recipe(
            'utils.operation',
            operator=approved_user_operator.operator,
            registration_purpose='Potential Reporting Operation',
        )
        response = TestUtils.mock_get_with_auth_role(
            self, "cas_admin", custom_reverse_lazy("get_operation_v2", kwargs={"operation_id": operation.id})
        )
        assert response.status_code == 200
        response_data = response.json()
        assert response_data.get("id") == str(operation.id)
        print(response_data)
        assert response_data.get("registration_purpose") == 'Potential Reporting Operation'

    def test_operations_with_documents_endpoint_get_success(self):
        approved_user_operator = baker.make_recipe('utils.approved_user_operator', user=self.user)
        operation = baker.make_recipe('utils.operation', operator=approved_user_operator.operator)
        response = TestUtils.mock_get_with_auth_role(
            self,
            "cas_admin",
            custom_reverse_lazy("get_operation_with_documents", kwargs={"operation_id": operation.id}),
        )
        assert response.status_code == 200
        response_data = response.json()
        assert response_data.get("id") == str(operation.id)

    def test_operations_endpoint_put_success(self):
        approved_user_operator = baker.make_recipe('utils.approved_user_operator', user=self.user)
        operation = baker.make_recipe('utils.operation', operator=approved_user_operator.operator)
        response = TestUtils.mock_put_with_auth_role(
            self,
            "industry_user",
            self.content_type,
            json.dumps(self.test_payload),
            custom_reverse_lazy("update_operation_v2", kwargs={"operation_id": operation.id}),
        )
        assert response.status_code == 200
        response_data = response.json()
        assert response_data.get("id") == str(operation.id)
