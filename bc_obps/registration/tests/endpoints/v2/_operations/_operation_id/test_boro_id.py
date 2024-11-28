from registration.models.operation import Operation
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.utils import custom_reverse_lazy
from model_bakery import baker


class TestOperationBoroIdEndpoint(CommonTestSetup):
    def test_authorized_role_can_patch(self):

        response = TestUtils.mock_patch_with_auth_role(
            self,
            'cas_director',
            self.content_type,
            {},
            custom_reverse_lazy(
                "operation_boro_id",
                kwargs={'operation_id': baker.make_recipe('utils.operation', status=Operation.Statuses.REGISTERED).id},
            ),
        )
        assert response.status_code == 200
        assert response.json()['id'] is not None
