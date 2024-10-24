from registration.models.operation import Operation
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.utils import custom_reverse_lazy
from model_bakery import baker


class TestOperationBoroIdEndpoint(CommonTestSetup):
    def test_boro_id_endpoint_unauthorized_roles_cannot_patch(self):
        operation = baker.make_recipe(
            'utils.operation',
        )
        roles = ["cas_pending", "industry_user"]
        for role in roles:
            response = TestUtils.mock_patch_with_auth_role(
                self,
                role,
                self.content_type,
                {},
                custom_reverse_lazy("operation_boro_id", kwargs={'operation_id': operation.id}),
            )
            assert response.status_code == 401
            assert response.json()['detail'] == "Unauthorized"

    def test_authorized_role_can_patch(self):
        operation = baker.make_recipe('utils.operation', status=Operation.Statuses.REGISTERED)

        response = TestUtils.mock_patch_with_auth_role(
            self,
            "cas_admin",
            self.content_type,
            {},
            custom_reverse_lazy("operation_boro_id", kwargs={'operation_id': operation.id}),
        )
        assert response.status_code == 200
        assert response.json()['id'] is not None
