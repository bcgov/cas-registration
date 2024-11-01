from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.utils import custom_reverse_lazy
from model_bakery import baker


class TestOperationBcghgIdEndpoint(CommonTestSetup):
    def test_bcghg_id_endpoint_unauthorized_roles_cannot_patch(self):
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
                custom_reverse_lazy("operation_bcghg_id", kwargs={'operation_id': operation.id}),
            )
            assert response.status_code == 401
            assert response.json()['detail'] == "Unauthorized"

    # def test_authorized_role_can_patch(self):
    #     roles = ["cas_admin", "cas_analyst"]
    #     for role in roles:
    #         response = TestUtils.mock_patch_with_auth_role(
    #             self,
    #             role,
    #             self.content_type,
    #             {},
    #             custom_reverse_lazy(
    #                 "operation_bcghg_id",
    #                 kwargs={
    #                     'operation_id': baker.make_recipe('utils.operation')
    #                 },
    #             ),
    #         )
    #         assert response.status_code == 200
    #         assert response.json()['id'] is ???
