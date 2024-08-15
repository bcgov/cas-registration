from registration.models.operation import Operation
from registration.models.registration_purpose import RegistrationPurpose
from registration.tests.utils.bakers import operator_baker
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.utils import custom_reverse_lazy
from model_bakery import baker


class TestOperationRegistrationInformationEndpoint(CommonTestSetup):
    def test_register_operation_information_endpoint_unauthorized_roles_cannot_put(self):
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
                custom_reverse_lazy("register_operation_information", kwargs={'operation_id': operation.id}),
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
                'registration_purpose': RegistrationPurpose.Purposes.ELECTRICITY_IMPORT_OPERATION,
            },
            custom_reverse_lazy("register_operation_information", kwargs={'operation_id': operation.id}),
        )
        assert response.status_code == 401

    def test_register_operation_information_endpoint_success(self):
        approved_user_operator = baker.make_recipe('utils.approved_user_operator', user=self.user)
        operation = baker.make_recipe('utils.operation', operator=approved_user_operator.operator)
        response = TestUtils.mock_put_with_auth_role(
            self,
            "industry_user",
            self.content_type,
            {
                'registration_purpose': RegistrationPurpose.Purposes.ELECTRICITY_IMPORT_OPERATION,
            },
            custom_reverse_lazy("register_operation_information", kwargs={'operation_id': operation.id}),
        )
        response_json = response.json()

        # Assert
        assert response.status_code == 200
        # Additional Assertions
        assert response_json['id'] == str(operation.id)

    def test_register_operation_information_endpoint_fail(self):
        approved_user_operator = baker.make_recipe('utils.approved_user_operator', user=self.user)
        operation = baker.make_recipe('utils.operation', operator=approved_user_operator.operator)
        response = TestUtils.mock_put_with_auth_role(
            self,
            "industry_user",
            self.content_type,
            {
                'bad data': 'im bad',
            },
            custom_reverse_lazy("register_operation_information", kwargs={'operation_id': operation.id}),
        )

        # Assert
        assert response.status_code == 422


class TestOperationRegistrationSubmissionEndpoint(CommonTestSetup):
    def test_submission_endpoint_unauthorized_roles_cannot_patch(self):
        operation = baker.make_recipe(
            'utils.operation',
        )
        roles = ["cas_pending", "cas_analyst", "cas_admin", "industry_user"]
        for role in roles:
            response = TestUtils.mock_patch_with_auth_role(
                self,
                role,
                self.content_type,
                {},
                custom_reverse_lazy("operation_registration_submission", kwargs={'operation_id': operation.id}),
            )
            assert response.status_code == 401

    def test_submission_endpoint_users_can_only_update_their_operations(self):
        operation = baker.make_recipe(
            'utils.operation',
        )
        TestUtils.authorize_current_user_as_operator_user(self, operator_baker())
        response = TestUtils.mock_patch_with_auth_role(
            self,
            "industry_user",
            self.content_type,
            {
                'acknowledgement_of_review': True,
                'acknowledgement_of_information': True,
                'acknowledgement_of_records': True,
            },
            custom_reverse_lazy("operation_registration_submission", kwargs={'operation_id': operation.id}),
        )
        assert response.status_code == 401

    def test_submission_endpoint_raises_exception_if_not_all_checkboxes_are_checked(self):
        operation = baker.make_recipe(
            'utils.operation',
        )
        TestUtils.authorize_current_user_as_operator_user(self, operator_baker())
        response = TestUtils.mock_patch_with_auth_role(
            self,
            "industry_user",
            self.content_type,
            {
                'acknowledgement_of_review': True,
                'acknowledgement_of_information': True,
                'acknowledgement_of_records': False,
            },
            custom_reverse_lazy("operation_registration_submission", kwargs={'operation_id': operation.id}),
        )
        assert response.status_code == 400
        assert response.json()['message'] == "All checkboxes must be checked to submit the registration."

    def test_submission_endpoint_success(self):
        approved_user_operator = baker.make_recipe('utils.approved_user_operator', user=self.user)
        operation = baker.make_recipe('utils.operation', operator=approved_user_operator.operator)
        response = TestUtils.mock_patch_with_auth_role(
            self,
            "industry_user",
            self.content_type,
            {
                'acknowledgement_of_review': True,
                'acknowledgement_of_information': True,
                'acknowledgement_of_records': True,
            },
            custom_reverse_lazy("operation_registration_submission", kwargs={'operation_id': operation.id}),
        )
        # Assert
        assert response.status_code == 200
        # Additional Assertions
        response_operation: Operation = Operation.objects.get(id=operation.id)
        assert response_operation.status == Operation.Statuses.REGISTERED

    def test_submission_endpoint_malformed_data(self):
        approved_user_operator = baker.make_recipe('utils.approved_user_operator', user=self.user)
        operation = baker.make_recipe('utils.operation', operator=approved_user_operator.operator)
        response = TestUtils.mock_patch_with_auth_role(
            self,
            "industry_user",
            self.content_type,
            {
                'bad data': 'im bad',
            },
            custom_reverse_lazy("operation_registration_submission", kwargs={'operation_id': operation.id}),
        )

        # Assert
        assert response.status_code == 422
