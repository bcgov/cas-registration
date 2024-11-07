from registration.tests.utils.helpers import CommonTestSetup
from registration.tests.utils.helpers import TestUtils
from registration.utils import custom_reverse_lazy
from model_bakery import baker


class TestOperationBcghgIdEndpoint(CommonTestSetup):
    def test_authorized_role_can_issue_id(self):
        operation = baker.make_recipe('utils.operation')
        roles = ["cas_admin", "cas_analyst"]
        for role in roles:
            response = TestUtils.mock_patch_with_auth_role(
                self,
                role,
                self.content_type,
                {},
                custom_reverse_lazy(
                    "operation_bcghg_id",
                    kwargs={'operation_id': operation.id},
                ),
            )
            assert response.status_code == 200
            assert response.json() == {'id': '14862100001'}  # '1' and '486210' come from the recipe's mock data
