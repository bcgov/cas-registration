from registration.tests.utils.helpers import CommonTestSetup


class TestFacilityBcghgIdEndpoint(CommonTestSetup):
   
    def test_authorized_role_can_issue_id(self):
        timeline = baker.make_recipe('utils.facility_designated_operation_timeline', end_date=None)
        roles = ["cas_admin", "cas_analyst"]
        for role in roles:
            response = TestUtils.mock_patch_with_auth_role(
                self,
                role,
                self.content_type,
                {},
                custom_reverse_lazy(
                    "facility_bcghg_id",
                    kwargs={'facility_id': timeline.facility.id},
                ),
            )
            assert response.status_code == 200
            assert response.json()['id'] == '14862100001'  # '1' and '486210' come from the recipe's mock data
