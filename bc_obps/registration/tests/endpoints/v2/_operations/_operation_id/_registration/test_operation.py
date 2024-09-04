from registration.models.registration_purpose import RegistrationPurpose
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.utils import custom_reverse_lazy
from model_bakery import baker


class TestOperationRegistrationInformationEndpoint(CommonTestSetup):
    def test_register_edit_operation_information_endpoint_unauthorized_roles_cannot_put(self):
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
                    'registration_purpose': RegistrationPurpose.Purposes.ELECTRICITY_IMPORT_OPERATION,
                },
                custom_reverse_lazy("register_edit_operation_information", kwargs={'operation_id': operation.id}),
            )
            assert response.status_code == 401
            assert response.json()['detail'] == "Unauthorized"

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
                'registration_purpose': RegistrationPurpose.Purposes.ELECTRICITY_IMPORT_OPERATION,
            },
            custom_reverse_lazy("register_edit_operation_information", kwargs={'operation_id': operation.id}),
        )
        assert response.status_code == 401

    def test_register_edit_operation_information_endpoint_success(self):
        approved_user_operator = baker.make_recipe('utils.approved_user_operator', user=self.user)
        operation = baker.make_recipe('utils.operation', operator=approved_user_operator.operator)
        response = TestUtils.mock_put_with_auth_role(
            self,
            "industry_user",
            self.content_type,
            {
                'registration_purpose': RegistrationPurpose.Purposes.ELECTRICITY_IMPORT_OPERATION,
            },
            custom_reverse_lazy("register_edit_operation_information", kwargs={'operation_id': operation.id}),
        )
        response_json = response.json()

        # Assert
        assert response.status_code == 200
        # Additional Assertions
        assert response_json['id'] == str(operation.id)

    def test_register_edit_operation_information_endpoint_fail(self):
        approved_user_operator = baker.make_recipe('utils.approved_user_operator', user=self.user)
        operation = baker.make_recipe('utils.operation', operator=approved_user_operator.operator)
        response = TestUtils.mock_put_with_auth_role(
            self,
            "industry_user",
            self.content_type,
            {
                'bad data': 'im bad',
            },
            custom_reverse_lazy("register_edit_operation_information", kwargs={'operation_id': operation.id}),
        )

        # Assert
        assert response.status_code == 422
