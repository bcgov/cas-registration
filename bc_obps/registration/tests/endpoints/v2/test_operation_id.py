from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.utils import custom_reverse_lazy
from model_bakery import baker


class TestOperationRepresentativeEndpoint(CommonTestSetup):
    def test_register_operation_operation_representative_endpoint_unauthorized_roles_cannot_put(self):
        operation = baker.make_recipe(
            'utils.operation',
        )
        # cas users and unapproved industry users can't put
        roles = ["cas_pending", "cas_analyst", "cas_admin", "industry_user"]
        for role in roles:
            response = TestUtils.mock_put_with_auth_role(
                self,
                role,
                self.content_type,
                {
                    'operation_representatives': [1, 2, 3],
                },
                custom_reverse_lazy(
                    "register_operation_operation_representative", kwargs={'operation_id': operation.id}
                ),
            )
            assert response.status_code == 401

    def test_users_cannot_update_other_users_operations(self):
        # authorize current user
        baker.make_recipe('utils.approved_user_operator', user=self.user)
        operation = baker.make_recipe(
            'utils.operation',
        )

        response = TestUtils.mock_put_with_auth_role(
            self,
            "industry_user",
            self.content_type,
            {
                'operation_representatives': [1, 2, 3],
            },
            custom_reverse_lazy("register_operation_operation_representative", kwargs={'operation_id': operation.id}),
        )
        assert response.status_code == 401

    def test_register_operation_operation_representative_endpoint_success(self):
        approved_user_operator = baker.make_recipe('utils.approved_user_operator', user=self.user)
        operation = baker.make_recipe('utils.operation', operator=approved_user_operator.operator)
        contacts = baker.make_recipe('utils.contact', _quantity=3)
        contact_ids = []
        for contact in contacts:
            contact_ids.append(contact.id)
        response = TestUtils.mock_put_with_auth_role(
            self,
            "industry_user",
            self.content_type,
            {
                'operation_representatives': contact_ids,
            },
            custom_reverse_lazy("register_operation_operation_representative", kwargs={'operation_id': operation.id}),
        )

        # Assert
        assert response.status_code == 200
        assert response.json().get('name') == operation.name

    def test_register_operation_operation_representative_endpoint_bad_data(self):
        approved_user_operator = baker.make_recipe('utils.approved_user_operator', user=self.user)
        operation = baker.make_recipe('utils.operation', operator=approved_user_operator.operator)
        response = TestUtils.mock_put_with_auth_role(
            self,
            "industry_user",
            self.content_type,
            {
                'operation_representatives': 'i should be a list',
            },
            custom_reverse_lazy("register_operation_operation_representative", kwargs={'operation_id': operation.id}),
        )

        # Assert
        assert response.status_code == 422
