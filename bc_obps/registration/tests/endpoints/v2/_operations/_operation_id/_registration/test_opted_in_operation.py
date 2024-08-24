from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.utils import custom_reverse_lazy
from model_bakery import baker


class TestOperationRegistrationOptedInOperationEndpoints(CommonTestSetup):
    # GET
    def test_opted_in_operation_detail_endpoint_unauthorized_roles_cannot_get(self):
        operation = baker.make_recipe(
            'utils.operation',
        )
        roles = ["cas_pending", "cas_analyst", "cas_admin", "industry_user"]
        for role in roles:
            response = TestUtils.mock_get_with_auth_role(
                self,
                role,
                custom_reverse_lazy(
                    "operation_registration_get_opted_in_operation_detail", kwargs={'operation_id': operation.id}
                ),
            )
            assert response.status_code == 401
            assert response.json()['detail'] == "Unauthorized"
