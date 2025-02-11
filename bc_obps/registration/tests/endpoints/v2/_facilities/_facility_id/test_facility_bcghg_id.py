from registration.tests.utils.helpers import CommonTestSetup
from registration.tests.utils.helpers import TestUtils
from registration.utils import custom_reverse_lazy
from model_bakery import baker


class TestFacilityBcghgIdEndpoint(CommonTestSetup):
    def test_authorized_role_can_issue_id(self):
        timeline = baker.make_recipe('registration.tests.utils.facility_designated_operation_timeline', end_date=None)
        response = TestUtils.mock_patch_with_auth_role(
            self,
            'cas_director',
            self.content_type,
            {},
            custom_reverse_lazy(
                "facility_bcghg_id",
                kwargs={'facility_id': timeline.facility.id},
            ),
        )
        assert response.status_code == 200
        assert response.json() == {'id': '14862100001'}  # '1' and '486210' come from the recipe's mock data
