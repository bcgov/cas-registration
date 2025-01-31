from datetime import datetime
from zoneinfo import ZoneInfo
from model_bakery import baker
from localflavor.ca.models import CAPostalCodeField
import pytest
from registration.enums.enums import BoroIdApplicationStates
from registration.models import (
    Operation,
    User,
    Operator,
)
from registration.tests.utils.helpers import CommonTestSetup, TestUtils

from registration.tests.utils.bakers import operation_baker, operator_baker
from registration.utils import custom_reverse_lazy

baker.generators.add(CAPostalCodeField, TestUtils.mock_postal_code)

fake_timestamp_from_past = '2024-01-09 14:13:08.888903-0800'
fake_timestamp_from_past_str_format = '%Y-%m-%d %H:%M:%S.%f%z'


class TestUpdateOperationStatusEndpoint(CommonTestSetup):
    endpoint = CommonTestSetup.base_endpoint + "operations"

    @pytest.fixture(autouse=True)
    def setup_mocks(self, mocker):
        # Setup the mock here; it will be executed before each test method
        self.mock_send_boro_id_application_email = mocker.patch(
            "service.operation_service.send_boro_id_application_email"
        )

    def test_cas_admin_approves_operation(self):
        operation = baker.make_recipe('utils.operation')
        assert operation.status == Operation.Statuses.NOT_STARTED
        url = custom_reverse_lazy("v1_update_operation_status", kwargs={"operation_id": operation.id})

        now = datetime.now(ZoneInfo("UTC"))
        put_response_1 = TestUtils.mock_put_with_auth_role(
            self, "cas_admin", self.content_type, {"status": "Approved"}, url
        )
        assert put_response_1.status_code == 200
        put_response_1_dict = put_response_1.json()
        assert put_response_1_dict.get("id") == str(operation.id)  # string representation of UUID
        assert put_response_1_dict.keys() == {
            "id",
            "status",
        }  # Make sure the response has the expected keys based on the schema
        operation_after_put = Operation.objects.get(id=operation.id)
        assert operation_after_put.status == Operation.Statuses.APPROVED
        assert operation_after_put.verified_by == self.user
        assert operation_after_put.bc_obps_regulated_operation is not None

        operator = Operator.objects.get(id=operation.operator_id)
        assert operator.status == Operator.Statuses.APPROVED
        assert operator.is_new is False
        assert operator.verified_by == self.user
        assert operator.verified_at.strftime("%Y-%m-%d") == now.strftime("%Y-%m-%d")
        operation.refresh_from_db()

        self.mock_send_boro_id_application_email.assert_called_once_with(
            application_state=BoroIdApplicationStates.APPROVED,
            operator_legal_name=operation.operator.legal_name,
            operation_name=operation.name,
            opted_in=operation.opt_in,
            operation_creator=operation.created_by,
            point_of_contact=operation.point_of_contact,
        )

        get_response = TestUtils.mock_get_with_auth_role(
            self, "cas_admin", custom_reverse_lazy("v1_get_operation", kwargs={"operation_id": operation.id})
        )
        assert get_response.status_code == 200
        get_response_dict = get_response.json()
        assert get_response_dict.get("status") == "Approved"

        # Changing the operator of the operation to a different operator with approved status
        # should not change other fields of the operator
        random_time = datetime.now(ZoneInfo("UTC"))
        random_user = baker.make(User)
        new_operator = operator_baker()
        new_operator.status = Operator.Statuses.APPROVED
        new_operator.verified_at = random_time
        new_operator.verified_by = random_user
        new_operator.save(update_fields=['status', 'verified_at', 'verified_by'])
        operation.operator = new_operator
        operation.save()

        put_response_2 = TestUtils.mock_put_with_auth_role(
            self, "cas_admin", self.content_type, {"status": "Approved"}, url
        )
        assert put_response_2.status_code == 200
        assert new_operator.status == Operator.Statuses.APPROVED
        assert new_operator.verified_at == random_time
        assert new_operator.verified_by == random_user
        assert new_operator.verified_by != self.user

    def test_cas_admin_declines_operation(self):
        operation = operation = operation_baker()
        assert operation.status == Operation.Statuses.NOT_STARTED
        put_response = TestUtils.mock_put_with_auth_role(
            self,
            "cas_admin",
            self.content_type,
            {"status": "Declined"},
            custom_reverse_lazy("v1_update_operation_status", kwargs={"operation_id": operation.id}),
        )
        assert put_response.status_code == 200
        put_response_dict = put_response.json()
        assert put_response_dict.get("id") == str(operation.id)  # string representation of UUID
        assert put_response_dict.keys() == {
            "id",
            "status",
        }  # Make sure the response has the expected keys based on the schema
        operation_after_put = Operation.objects.get(id=operation.id)
        assert operation_after_put.status == Operation.Statuses.DECLINED
        assert operation_after_put.verified_by == self.user
        assert operation_after_put.bc_obps_regulated_operation is None

        operation.refresh_from_db()
        self.mock_send_boro_id_application_email.assert_called_once_with(
            application_state=BoroIdApplicationStates.DECLINED,
            operator_legal_name=operation.operator.legal_name,
            operation_name=operation.name,
            opted_in=operation.opt_in,
            operation_creator=operation.created_by,
            point_of_contact=operation.point_of_contact,
        )

        get_response = TestUtils.mock_get_with_auth_role(
            self, "cas_admin", custom_reverse_lazy("v1_get_operation", kwargs={"operation_id": operation.id})
        )
        assert get_response.status_code == 200
        get_response_dict = get_response.json()
        assert get_response_dict.get("status") == "Declined"

    def test_cas_admin_requests_changes_on_operation(self):
        operation = operation = operation_baker()
        assert operation.status == Operation.Statuses.NOT_STARTED
        put_response = TestUtils.mock_put_with_auth_role(
            self,
            "cas_admin",
            self.content_type,
            {"status": "Changes Requested"},
            custom_reverse_lazy("v1_update_operation_status", kwargs={"operation_id": operation.id}),
        )
        assert put_response.status_code == 200
        put_response_dict = put_response.json()
        assert put_response_dict.get("id") == str(operation.id)  # string representation of UUID
        assert put_response_dict.keys() == {
            "id",
            "status",
        }  # Make sure the response has the expected keys based on the schema
        operation_after_put = Operation.objects.get(id=operation.id)
        assert operation_after_put.status == Operation.Statuses.CHANGES_REQUESTED
        assert operation_after_put.verified_by is None
        assert operation_after_put.bc_obps_regulated_operation is None

        operation.refresh_from_db()
        self.mock_send_boro_id_application_email.assert_called_once_with(
            application_state=BoroIdApplicationStates.CHANGES_REQUESTED,
            operator_legal_name=operation.operator.legal_name,
            operation_name=operation.name,
            opted_in=operation.opt_in,
            operation_creator=operation.created_by,
            point_of_contact=operation.point_of_contact,
        )

        get_response = TestUtils.mock_get_with_auth_role(
            self, "cas_admin", custom_reverse_lazy("v1_get_operation", kwargs={"operation_id": operation.id})
        )
        assert get_response.status_code == 200
        get_response_dict = get_response.json()
        assert get_response_dict.get("status") == "Changes Requested"

    def test_put_operation_not_verified_when_not_registered(self):
        operation = operation_baker()
        assert operation.status == Operation.Statuses.NOT_STARTED

        put_response = TestUtils.mock_put_with_auth_role(
            self,
            "cas_admin",
            self.content_type,
            {"status": "Not Started"},
            custom_reverse_lazy("v1_update_operation_status", kwargs={"operation_id": operation.id}),
        )
        assert put_response.status_code == 200
        put_response_dict = put_response.json()
        assert put_response_dict.get("id") == str(operation.id)  # string representation of UUID
        operation_after_put = Operation.objects.get(id=operation.id)
        assert operation_after_put.status == Operation.Statuses.NOT_STARTED
        assert operation_after_put.verified_by is None
        assert operation_after_put.bc_obps_regulated_operation is None

        get_response = TestUtils.mock_get_with_auth_role(
            self, "cas_admin", custom_reverse_lazy("v1_get_operation", kwargs={"operation_id": operation.id})
        )
        assert get_response.status_code == 200
        get_response_dict = get_response.json()
        assert get_response_dict.get("status") == "Not Started"
        assert get_response_dict.get("verified_at") is None

    def test_cas_admin_updates_operation_status_with_invalid_data(self):
        operation = operation_baker()
        assert operation.status == Operation.Statuses.NOT_STARTED

        response = TestUtils.mock_put_with_auth_role(
            self,
            "cas_admin",
            self.content_type,
            {"status": "nonsense"},
            custom_reverse_lazy("v1_update_operation_status", kwargs={"operation_id": operation.id}),
        )
        assert response.status_code == 400
        assert response.json().get('message') == "'nonsense' is not a valid Operation.Statuses"
