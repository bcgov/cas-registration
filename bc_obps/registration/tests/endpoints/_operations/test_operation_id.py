from model_bakery import baker
from registration.models import (
    UserOperator,
)
from registration.models.operation import Operation
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.tests.utils.bakers import operation_baker, operator_baker
from registration.utils import custom_reverse_lazy
import json

from common.tests.utils.test_files import create_test_file


class TestOperationIdEndpoint(CommonTestSetup):
    endpoint = CommonTestSetup.base_endpoint + "operations"

    def test_industry_users_can_only_get_their_own_operations(self):
        random_operator = operator_baker()
        the_users_operator = operator_baker()
        user_operator = baker.make(
            UserOperator,
            user_id=self.user.user_guid,
            status=UserOperator.Statuses.APPROVED,
            operator=the_users_operator,
        )

        random_operation = operation_baker(random_operator.id)
        users_operation = operation_baker(user_operator.operator.id)

        response_1 = TestUtils.mock_get_with_auth_role(
            self, "industry_user", custom_reverse_lazy("get_operation", kwargs={"operation_id": users_operation.id})
        )

        assert response_1.status_code == 200

        response_2 = TestUtils.mock_get_with_auth_role(
            self, "industry_user", custom_reverse_lazy("get_operation", kwargs={"operation_id": random_operation.id})
        )
        # RLS makes this 404 instead of 401
        # assert response_2.status_code == 404
        assert response_2.status_code == 401

    def test_industry_users_can_only_get_their_own_operations_with_documents(self):
        random_operator = operator_baker()
        the_users_operator = operator_baker()
        user_operator = baker.make(
            UserOperator,
            user_id=self.user.user_guid,
            status=UserOperator.Statuses.APPROVED,
            operator=the_users_operator,
        )

        random_operation = operation_baker(random_operator.id)
        users_operation = operation_baker(user_operator.operator.id)

        response_1 = TestUtils.mock_get_with_auth_role(
            self,
            "industry_user",
            custom_reverse_lazy("get_operation_with_documents", kwargs={"operation_id": users_operation.id}),
        )

        assert response_1.status_code == 200

        response_2 = TestUtils.mock_get_with_auth_role(
            self,
            "industry_user",
            custom_reverse_lazy("get_operation_with_documents", kwargs={"operation_id": random_operation.id}),
        )
        # RLS makes this 404 instead of 401
        # assert response_2.status_code == 404
        assert response_2.status_code == 401

    def test_operations_endpoint_get_success(self):
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator', user=self.user)
        operation = baker.make_recipe(
            'registration.tests.utils.operation',
            operator=approved_user_operator.operator,
            registration_purpose='Potential Reporting Operation',
        )
        response = TestUtils.mock_get_with_auth_role(
            self, "cas_admin", custom_reverse_lazy("get_operation", kwargs={"operation_id": operation.id})
        )
        assert response.status_code == 200
        response_data = response.json()
        assert response_data.get("id") == str(operation.id)
        assert response_data.get("registration_purpose") == 'Potential Reporting Operation'

    def test_operations_with_documents_endpoint_get_success(self):
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator', user=self.user)
        operation = baker.make_recipe('registration.tests.utils.operation', operator=approved_user_operator.operator)
        response = TestUtils.mock_get_with_auth_role(
            self,
            "cas_admin",
            custom_reverse_lazy("get_operation_with_documents", kwargs={"operation_id": operation.id}),
        )
        assert response.status_code == 200
        response_data = response.json()
        assert response_data.get("id") == str(operation.id)

    def test_operations_endpoint_post_success(self):
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator', user=self.user)
        operation = baker.make_recipe(
            'registration.tests.utils.operation',
            operator=approved_user_operator.operator,
            status=Operation.Statuses.REGISTERED,
        )
        contact = baker.make_recipe('registration.tests.utils.contact')

        test_payload = {
            "payload": json.dumps(
                {
                    "registration_purpose": "Reporting Operation",
                    "regulated_products": [1],
                    "name": "op name",
                    "type": Operation.Types.SFO,
                    "naics_code_id": 1,
                    "secondary_naics_code_id": 2,
                    "tertiary_naics_code_id": 3,
                    "activities": [1],
                    "operation_representatives": [contact.id],
                }
            ),
            "boundary_map": create_test_file("test_boundary_map.docx"),
            "process_flow_diagram": create_test_file("test_process_flow_diagram.pdf"),
        }

        response = TestUtils.client.post(
            path=custom_reverse_lazy("update_operation", kwargs={"operation_id": operation.id}),
            data=test_payload,
            format="multipart",
            HTTP_AUTHORIZATION=self.auth_header_dumps,
        )

        assert response.status_code == 200
        response_data = response.json()
        assert response_data.get("id") == str(operation.id)
