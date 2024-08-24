from model_bakery import baker
from localflavor.ca.models import CAPostalCodeField
from registration.tests.utils.helpers import CommonTestSetup, TestUtils

from registration.utils import custom_reverse_lazy

baker.generators.add(CAPostalCodeField, TestUtils.mock_postal_code)

fake_timestamp_from_past = '2024-01-09 14:13:08.888903-0800'
fake_timestamp_from_past_str_format = '%Y-%m-%d %H:%M:%S.%f%z'


class TestOperationsCurrentEndpoint(CommonTestSetup):
    endpoint = CommonTestSetup.base_endpoint + "operations"

    # AUTHORIZATION

    def test_unauthorized_roles_cannot_get_current_operations(self):
        # IRC users and unapproved industry users can't get
        for role in ['cas_pending', 'cas_admin', 'cas_analyst', 'industry_user']:
            response = TestUtils.mock_get_with_auth_role(
                self, role, custom_reverse_lazy("list_current_users_operations")
            )
            assert response.status_code == 401

    # GET
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
