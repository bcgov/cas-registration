from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.utils import custom_reverse_lazy
from model_bakery import baker


class TestOperationsContactsEndpoint(CommonTestSetup):

    # GET
    def test_authorized_roles_can_list_operations_contacts(self):
        approved_user_operator = baker.make_recipe('utils.approved_user_operator', user=self.user)
        operation_1 = baker.make_recipe('utils.operation', operator=approved_user_operator.operator)
        operation_1_contacts = baker.make_recipe('utils.contact', _quantity=3)
        operation_1.contacts.set(operation_1_contacts)

        operation_2 = baker.make_recipe('utils.operation')
        operation_2_contacts = baker.make_recipe('utils.contact', _quantity=3)
        operation_2.contacts.set(operation_2_contacts)

        # Admin user has access to all operations
        for operation in [operation_1, operation_2]:
            response_1 = TestUtils.mock_get_with_auth_role(
                self,
                'cas_admin',
                custom_reverse_lazy("list_operation_representatives", kwargs={'operation_id': operation.id}),
            )
            assert response_1.status_code == 200
            assert len(response_1.json()) == 3

        # Industry user has access to only their operations
        response_2 = TestUtils.mock_get_with_auth_role(
            self,
            'industry_user',
            custom_reverse_lazy("list_operation_representatives", kwargs={'operation_id': operation_1.id}),
        )
        assert response_2.status_code == 200
        response_json = response_2.json()
        assert len(response_json) == 3
        # Assert that the contacts returned are the same as the ones added to the operation
        for contact in response_json:
            assert contact.get('id') in [contact.id for contact in operation_1_contacts]

        # Industry user does not have access to operation_2
        response_3 = TestUtils.mock_get_with_auth_role(
            self,
            'industry_user',
            custom_reverse_lazy("list_operation_representatives", kwargs={'operation_id': operation_2.id}),
        )
        assert response_3.status_code == 401
        assert response_3.json().get('message') == 'Unauthorized.'
