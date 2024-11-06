from registration.tests.constants import MOCK_DATA_URL
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.utils import custom_reverse_lazy
from model_bakery import baker
import json


class TestOperationRegistrationInformationEndpoint(CommonTestSetup):
    mock_payload = {
        "registration_purpose": "Reporting Operation",
        "regulated_products": [1],
        "name": "op name",
        "type": "SFO",
        "naics_code_id": 1,
        "secondary_naics_code_id": 2,
        "tertiary_naics_code_id": 3,
        "activities": [1],
        "boundary_map": MOCK_DATA_URL,
        "process_flow_diagram": MOCK_DATA_URL,
    }

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
            json.dumps(self.mock_payload),
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
            json.dumps(self.mock_payload),
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
