from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.models import Operation
from registration.utils import custom_reverse_lazy
from model_bakery import baker
from django.core.files.base import ContentFile


class TestPostOperationRegistrationInformationEndpoint(CommonTestSetup):

    mock_payload = {
        'registration_purpose': ['Reporting Operation'],
        'operation': ['556ceeb0-7e24-4d89-b639-61f625f82084'],
        'activities': ['31'],
        'name': ['Barbie'],
        'type': [Operation.Types.SFO],
        'naics_code_id': ['20'],
        'operation_has_multiple_operators': ['false'],
        'process_flow_diagram': ContentFile(bytes("testtesttesttest", encoding='utf-8'), "testfile.pdf"),
        'boundary_map': ContentFile(bytes("testtesttesttest", encoding='utf-8'), "testfile.pdf"),
    }

    def test_users_cannot_update_other_users_operations(self):
        # authorize current user
        baker.make_recipe('registration.tests.utils.approved_user_operator', user=self.user)
        operation = baker.make_recipe(
            'registration.tests.utils.operation',
        )
        response = TestUtils.client.post(
            custom_reverse_lazy("register_edit_operation_information", kwargs={'operation_id': operation.id}),
            data=self.mock_payload,
            HTTP_AUTHORIZATION=self.auth_header_dumps,
        )

        assert response.status_code == 401

    def test_register_edit_operation_information_endpoint_success(self):
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator', user=self.user)
        operation = baker.make_recipe('registration.tests.utils.operation', operator=approved_user_operator.operator)
        response = TestUtils.client.post(
            custom_reverse_lazy("register_edit_operation_information", kwargs={'operation_id': operation.id}),
            data=self.mock_payload,
            HTTP_AUTHORIZATION=self.auth_header_dumps,
        )
        response_json = response.json()

        # Assert
        assert response.status_code == 200
        # Additional Assertions
        assert response_json['id'] == str(operation.id)

    def test_register_edit_operation_information_endpoint_fail(self):
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator', user=self.user)
        operation = baker.make_recipe('registration.tests.utils.operation', operator=approved_user_operator.operator)
        response = TestUtils.client.post(
            custom_reverse_lazy("register_edit_operation_information", kwargs={'operation_id': operation.id}),
            data={'bad data': 'im bad'},
            HTTP_AUTHORIZATION=self.auth_header_dumps,
        )

        # Assert
        assert response.status_code == 422


class TestGetOperationRegistrationInformationEndpoint(CommonTestSetup):
    def test_users_cannot_get_other_users_operations(self):
        # authorize current user
        baker.make_recipe('registration.tests.utils.approved_user_operator', user=self.user)
        operation = baker.make_recipe(
            'registration.tests.utils.operation',
        )
        response = TestUtils.mock_get_with_auth_role(
            self,
            "industry_user",
            custom_reverse_lazy("register_get_operation_information", kwargs={'operation_id': operation.id}),
        )
        assert response.status_code == 401

    def test_register_get_operation_information_endpoint_success(self):
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator', user=self.user)
        operation = baker.make_recipe('registration.tests.utils.operation', operator=approved_user_operator.operator)
        baker.make_recipe('registration.tests.utils.multiple_operator', operation=operation)
        response = TestUtils.mock_get_with_auth_role(
            self,
            "industry_user",
            custom_reverse_lazy("register_get_operation_information", kwargs={'operation_id': operation.id}),
        )

        # Assert
        assert response.status_code == 200
        # keys don't include optional values (exclude_none=True is set in the endpoint) or attachments (GCS isn't set up in CI for testing)
        assert set(response.json().keys()) == {
            'registration_purpose',
            'operation',
            'naics_code_id',
            'multiple_operators_array',
            'operation_has_multiple_operators',
            'activities',
            'name',
            'type',
            'regulated_products',
        }
        assert len(response.json()['multiple_operators_array']) == 1
