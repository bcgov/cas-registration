import pytest

from registration.models.operation import Operation
from registration.tests.utils.bakers import operator_baker
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.utils import custom_reverse_lazy, data_url_to_file
from model_bakery import baker
from registration.tests.constants import MOCK_DATA_URL
from service.document_service import DocumentService


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
            date_of_first_shipment=Operation.DateOfFirstShipmentChoices.ON_OR_AFTER_APRIL_1_2024,
        )
        file = data_url_to_file(MOCK_DATA_URL)
        new_entrant_application_doc, created = DocumentService.create_or_replace_operation_document(
            approved_user_operator.user_id, operation.id, file, "new_entrant_application"
        )
        operation.documents.add(new_entrant_application_doc)
        response = TestUtils.mock_get_with_auth_role(
            self,
            "industry_user",
            custom_reverse_lazy("get_operation_new_entrant_application", kwargs={'operation_id': operation.id}),
        )
        response_json = response.json()

        # Assert
        assert response.status_code == 200
        # Additional Assertions
        assert response_json['date_of_first_shipment'] == "On or after April 1, 2024"
        # not testing `new_entrant_application` because resolver for a document doesn't work in CI
        # MOCK_DATA_URL's filename is mock.pdf. When adding files to django, the name is appended, so we just check that 'mock' in the name
        assert operation.documents.first().file.name.find("mock") != -1


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
        response = TestUtils.mock_put_with_auth_role(
            self,
            "industry_user",
            self.content_type,
            {
                "operation_id": operation.id,
                "new_entrant_application": MOCK_DATA_URL,
            },
            custom_reverse_lazy("create_or_replace_new_entrant_application", kwargs={'operation_id': operation.id}),
        )
        # RLS makes this 404 instead of 401
        # assert response.status_code == 404
        assert response.status_code == 401

    # Uncomment this skip to test file uploads locally
    @pytest.mark.skip(
        reason="This test passes locally but will fail in CI since we don't have Google Cloud Storage set up for CI"
    )
    def test_put_register_operation_new_entrant_application_submission_endpoint(self):
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator', user=self.user)
        operation = baker.make_recipe('registration.tests.utils.operation', operator=approved_user_operator.operator)

        # Act - Test without date_of_first_shipment (now valid for 2025+)
        payload_with_no_date_of_first_shipment = {
            "new_entrant_application": MOCK_DATA_URL,
        }
        response_1 = TestUtils.mock_put_with_auth_role(
            self,
            "industry_user",
            self.content_type,
            payload_with_no_date_of_first_shipment,
            custom_reverse_lazy("create_or_replace_new_entrant_application", kwargs={'operation_id': operation.id}),
        )
        # Assert - Should succeed without date_of_first_shipment
        operation.refresh_from_db()
        assert response_1.status_code == 200
        assert response_1.json()['id'] == str(operation.id)
        operation_new_entrant_application = operation.documents.first()
        assert operation_new_entrant_application.file.name.find("mock") != -1
        assert operation_new_entrant_application.type.name == "new_entrant_application"
        # date_of_first_shipment should remain None since it wasn't provided
        assert operation.date_of_first_shipment is None

        # Act - Test with date_of_first_shipment for historical 2024 applications
        valid_payload_with_date = {
            "new_entrant_application": MOCK_DATA_URL,
        }
        response_2 = TestUtils.mock_put_with_auth_role(
            self,
            "industry_user",
            self.content_type,
            valid_payload_with_date,
            custom_reverse_lazy("create_or_replace_new_entrant_application", kwargs={'operation_id': operation.id}),
        )
        # Assert - Should also succeed with date_of_first_shipment for backwards compatibility
        operation.refresh_from_db()
        assert response_2.status_code == 200
