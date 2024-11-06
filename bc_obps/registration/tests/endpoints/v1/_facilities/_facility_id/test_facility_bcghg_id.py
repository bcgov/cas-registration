from registration.tests.utils.helpers import CommonTestSetup


class TestFacilityBcghgIdEndpoint(CommonTestSetup):
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
    #                 "facility_bcghg_id",
    #                 kwargs={
    #                     'facility_id': baker.make_recipe('utils.facility')
    #                 },
    #             ),
    #         )
    #         assert response.status_code == 200
    #         assert response.json()['id'] is ???
