from registration.tests.utils.helpers import CommonTestSetup


class TestOperationBcghgIdEndpoint(CommonTestSetup):
    ...

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
