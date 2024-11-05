from model_bakery import baker
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.utils import custom_reverse_lazy


class TestOperationsCurrentEndpoint(CommonTestSetup):
    def test_get_current_users_operations(self):
        approved_user_operator = baker.make_recipe('utils.approved_user_operator', user=self.user)
        operation = baker.make_recipe('utils.operation', operator=approved_user_operator.operator)

        # operation for a different user_operator
        baker.make_recipe('utils.operation')

        response = TestUtils.mock_get_with_auth_role(
            self, 'industry_user', custom_reverse_lazy("list_current_users_operations")
        )
        assert response.status_code == 200
        assert len(response.json()) == 1
        assert response.json()[0].get('name') == operation.name
        assert response.json()[0].get('id') == str(operation.id)
