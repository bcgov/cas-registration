import pytest

from registration.models.operation import Operation
from registration.tests.utils.bakers import operator_baker
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.utils import custom_reverse_lazy
from model_bakery import baker
from service.document_service import DocumentService
from tests.test_files import create_test_file


class TestGetOperationNewEntrantApplicationEndpoint(CommonTestSetup):
    def test_get_register_operation_new_entrant_application_endpoint_users_can_only_get_their_operation(self):
        baker.make_recipe('registration.tests.utils.approved_user_operator', user=self.user)
        operation: Operation = baker.make_recipe(
            'registration.tests.utils.operation',
        )
        response = TestUtils.mock_get_with_auth_role(
            self,
            "industry_user",
            custom_reverse_lazy("get_operation_new_entrant_application", kwargs={'operation_id': operation.id}),
        )

        assert response.status_code == 401
        assert response.json()['message'] == "Unauthorized."
        # when RLS is enabled, we get a not found error because RLS prevents the user from selecting an operation that does not belong to them
        # assert response.status_code == 404
        # assert response.json()['message'] == "Not Found"

    def test_get_register_operation_new_entrant_application_endpoint_success(self):
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator', user=self.user)
        operation = baker.make_recipe(
            'registration.tests.utils.operation',
            operator=approved_user_operator.operator,
        )
        file = create_test_file("new_entrant_application.pdf")
        new_entrant_application_doc, _ = DocumentService.create_or_replace_operation_document(
            approved_user_operator.user_id, operation.id, file, "new_entrant_application"
        )
        operation.documents.add(new_entrant_application_doc)
        response = TestUtils.mock_get_with_auth_role(
            self,
            "industry_user",
            custom_reverse_lazy("get_operation_new_entrant_application", kwargs={'operation_id': operation.id}),
        )

        # Assert
        assert response.status_code == 200
        assert operation.documents.first().file.name.find("new_entrant_application") != -1


class TestPutOperationNewEntrantApplicationSubmissionEndpoint(CommonTestSetup):

    # # Uncomment this skip to test file uploads locally
    @pytest.mark.skip(
        reason="This test passes locally but will fail in CI since we don't have Google Cloud Storage set up for CI"
    )
    def test_put_register_operation_new_entrant_application_submission_endpoint_users_can_only_update_their_operations(
        self,
    ):
        operation = baker.make_recipe(
            'registration.tests.utils.operation',
        )
        TestUtils.authorize_current_user_as_operator_user(self, operator_baker())
        response = TestUtils.client.post(
            path=custom_reverse_lazy(
                "create_or_replace_new_entrant_application", kwargs={'operation_id': operation.id}
            ),
            data={
                "new_entrant_application": create_test_file("new_entrant_application.pdf"),
            },
            format='multipart',
            HTTP_AUTHORIZATION=self.auth_header_dumps,
        )

        assert response.status_code == 401

    # Uncomment this skip to test file uploads locally
    @pytest.mark.skip(
        reason="This test passes locally but will fail in CI since we don't have Google Cloud Storage set up for CI"
    )
    def test_put_register_operation_new_entrant_application_submission_endpoint(self):
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator', user=self.user)
        operation = baker.make_recipe('registration.tests.utils.operation', operator=approved_user_operator.operator)

        # Act - Test without date_of_first_shipment
        payload_without_date = {
            "new_entrant_application": create_test_file("new_entrant_application.pdf"),
        }
        response_1 = TestUtils.client.post(
            path=custom_reverse_lazy(
                "create_or_replace_new_entrant_application", kwargs={'operation_id': operation.id}
            ),
            data=payload_without_date,
            format='multipart',
            HTTP_AUTHORIZATION=self.auth_header_dumps,
        )
        # Assert - Should succeed without date_of_first_shipment
        operation.refresh_from_db()
        assert response_1.status_code == 200
        assert response_1.json()['id'] == str(operation.id)
        operation_new_entrant_application = operation.documents.first()
        assert operation_new_entrant_application.file.name.find("mock") != -1
        assert operation_new_entrant_application.type.name == "new_entrant_application"
        assert operation.date_of_first_shipment is None
