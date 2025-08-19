from registration.models import Operation
from registration.tests.utils.helpers import CommonTestSetup
from registration.tests.utils.helpers import TestUtils
from registration.utils import custom_reverse_lazy
from model_bakery import baker


class TestFacilityBcghgIdEndpoint(CommonTestSetup):
    def test_authorized_role_can_issue_id(self):
        operation = baker.make_recipe('registration.tests.utils.operation', status=Operation.Statuses.REGISTERED)
        facility = baker.make_recipe(
            'registration.tests.utils.facility',
            operation=operation,
        )
        response = TestUtils.mock_patch_with_auth_role(
            self,
            'cas_director',
            self.content_type,
            {},
            custom_reverse_lazy(
                "facility_bcghg_id",
                kwargs={'facility_id': facility.id},
            ),
        )
        assert response.status_code == 200
        assert response.json() == {'id': '14862100001'}  # '1' and '486210' come from the recipe's mock data

    def test_authorize_role_can_clear_id(self):
        operation = baker.make_recipe('registration.tests.utils.operation', status=Operation.Statuses.REGISTERED)
        facility = baker.make_recipe(
            'registration.tests.utils.facility',
            operation=operation,
            bcghg_id=baker.make_recipe('registration.tests.utils.bcghg_id', id='12233445566'),
        )

        response = TestUtils.mock_delete_with_auth_role(
            self,
            'cas_director',
            custom_reverse_lazy(
                "delete_facility_bcghg_id",
                kwargs={'facility_id': facility.id},
            ),
        )
        assert response.status_code == 200

        facility.refresh_from_db()
        assert facility.bcghg_id is None
