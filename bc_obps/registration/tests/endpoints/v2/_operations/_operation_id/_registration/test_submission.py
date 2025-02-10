from service.tests.test_operation_service_v2 import set_up_valid_mock_operation
from registration.models.operation import Operation
from registration.tests.utils.bakers import operator_baker
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.utils import custom_reverse_lazy
from model_bakery import baker


class TestOperationRegistrationSubmissionEndpoint(CommonTestSetup):
    def test_submission_endpoint_users_can_only_update_their_operations(self):
        # user is approved to access endpoint
        baker.make_recipe('registration.tests.utils.approved_user_operator', user=self.user)

        # create operation that does not belong to user
        operation = set_up_valid_mock_operation(Operation.Purposes.POTENTIAL_REPORTING_OPERATION)

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
            'registration.tests.utils.operation',
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
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator', user=self.user)
        operation = set_up_valid_mock_operation(Operation.Purposes.POTENTIAL_REPORTING_OPERATION)
        operation.operator = approved_user_operator.operator
        operation.save()
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
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator', user=self.user)
        operation = baker.make_recipe('registration.tests.utils.operation', operator=approved_user_operator.operator)
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
