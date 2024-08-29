from model_bakery import baker
from localflavor.ca.models import CAPostalCodeField
from registration.models import (
    UserOperator,
)
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.tests.utils.bakers import operation_baker, operator_baker, user_operator_baker
from registration.utils import custom_reverse_lazy

baker.generators.add(CAPostalCodeField, TestUtils.mock_postal_code)

fake_timestamp_from_past = '2024-01-09 14:13:08.888903-0800'
fake_timestamp_from_past_str_format = '%Y-%m-%d %H:%M:%S.%f%z'


class TestOperationIdEndpoint(CommonTestSetup):
    endpoint = CommonTestSetup.base_endpoint + "operations"

    def test_operations_endpoint_unauthorized_users_cannot_get(self):
        operation_instance_1 = operation_baker()
        # /operations
        # unauthorized roles can't get
        response = TestUtils.mock_get_with_auth_role(self, "cas_pending")
        assert response.status_code == 401
        # /operations/{operation_id}
        response = TestUtils.mock_get_with_auth_role(
            self,
            "cas_pending",
            custom_reverse_lazy("get_operation_v2", kwargs={"operation_id": operation_instance_1.id}),
        )
        assert response.status_code == 401

        # unapproved industry users can't get
        user_operator_instance = user_operator_baker()
        user_operator_instance.status = UserOperator.Statuses.PENDING
        user_operator_instance.user_id = self.user.user_guid
        user_operator_instance.save()

        response = TestUtils.mock_get_with_auth_role(self, "industry_user")
        assert response.status_code == 401
        # /operations/{operation_id}2
        response = TestUtils.mock_get_with_auth_role(
            self,
            "industry_user",
            custom_reverse_lazy("get_operation_v2", kwargs={"operation_id": operation_instance_1.id}),
        )
        assert response.status_code == 401

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

    def test_operations_endpoint_get_success(self):
        operation_instance = operation_baker()
        response = TestUtils.mock_get_with_auth_role(
            self, "cas_admin", custom_reverse_lazy("get_operation_v2", kwargs={"operation_id": operation_instance.id})
        )
        assert response.status_code == 200
        response_data = response.json()
        assert response_data.get("id") == str(operation_instance.id)
