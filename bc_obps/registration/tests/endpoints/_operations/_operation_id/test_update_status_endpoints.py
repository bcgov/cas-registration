import pytz
from datetime import datetime
from model_bakery import baker
from localflavor.ca.models import CAPostalCodeField
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


class TestOperationsEndpoint(CommonTestSetup):
    endpoint = CommonTestSetup.base_endpoint + "operations"

    # AUTHORIZATION

    def test_unauthorized_users_cannot_update_status(self):
        operation = operation_baker()

        response = TestUtils.mock_put_with_auth_role(
            self,
            "industry_user",
            self.content_type,
            {"status": "approved"},
            custom_reverse_lazy("update_operation_status", kwargs={"operation_id": operation.id}),
        )
        assert response.status_code == 401

    # PUT
    def test_put_operation_update_status_invalid_operation_id(self):
        put_response = TestUtils.mock_put_with_auth_role(
            self,
            "cas_admin",
            self.content_type,
            {"status": "approved"},
            custom_reverse_lazy("update_operation_status", kwargs={"operation_id": 99999999999}),
        )
        assert put_response.status_code == 422
        assert (
            put_response.json().get('detail')[0].get('msg')
            == 'Input should be a valid UUID, invalid length: expected length 32 for simple format, found 11'
        )

    def test_put_operation_update_status_approved(self):
        operation = operation_baker()
        assert operation.status == Operation.Statuses.NOT_STARTED
        url = custom_reverse_lazy("update_operation_status", kwargs={"operation_id": operation.id})

        now = datetime.now(pytz.utc)
        put_response_1 = TestUtils.mock_put_with_auth_role(
            self, "cas_admin", self.content_type, {"status": "Approved"}, url
        )
        assert put_response_1.status_code == 200
        put_response_1_dict = put_response_1.json()
        assert put_response_1_dict.get("id") == str(operation.id)  # string representation of UUID
        assert put_response_1_dict.keys() == {"id"}  # Make sure the response has the expected keys based on the schema
        operation_after_put = Operation.objects.get(id=operation.id)
        assert operation_after_put.status == Operation.Statuses.APPROVED
        assert operation_after_put.verified_by == self.user
        assert operation_after_put.bc_obps_regulated_operation is not None
        operator = Operator.objects.get(id=operation.operator_id)
        assert operator.status == Operator.Statuses.APPROVED
        assert operator.is_new is False
        assert operator.verified_by == self.user
        assert operator.verified_at.strftime("%Y-%m-%d") == now.strftime("%Y-%m-%d")

        get_response = TestUtils.mock_get_with_auth_role(
            self, "cas_admin", custom_reverse_lazy("get_operation", kwargs={"operation_id": operation.id})
        )
        assert get_response.status_code == 200
        get_response_dict = get_response.json()
        assert get_response_dict.get("status") == "Approved"

        # Changing the operator of the operation to a different operator with approved status
        # should not change other fields of the operator
        random_time = datetime.now(pytz.utc)
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

    def test_put_operation_update_status_declined(self):
        operation = operation = operation_baker()
        assert operation.status == Operation.Statuses.NOT_STARTED

        put_response = TestUtils.mock_put_with_auth_role(
            self,
            "cas_admin",
            self.content_type,
            {"status": "Declined"},
            custom_reverse_lazy("update_operation_status", kwargs={"operation_id": operation.id}),
        )
        assert put_response.status_code == 200
        put_response_dict = put_response.json()
        assert put_response_dict.get("id") == str(operation.id)  # string representation of UUID
        assert put_response_dict.keys() == {"id"}  # Make sure the response has the expected keys based on the schema
        operation_after_put = Operation.objects.get(id=operation.id)
        assert operation_after_put.status == Operation.Statuses.DECLINED
        assert operation_after_put.verified_by == self.user
        assert operation_after_put.bc_obps_regulated_operation is None

        get_response = TestUtils.mock_get_with_auth_role(
            self, "cas_admin", custom_reverse_lazy("get_operation", kwargs={"operation_id": operation.id})
        )
        assert get_response.status_code == 200
        get_response_dict = get_response.json()
        assert get_response_dict.get("status") == "Declined"

    def test_put_operation_not_verified_when_not_registered(self):
        operation = operation_baker()
        assert operation.status == Operation.Statuses.NOT_STARTED

        put_response = TestUtils.mock_put_with_auth_role(
            self,
            "cas_admin",
            self.content_type,
            {"status": "Not Started"},
            custom_reverse_lazy("update_operation_status", kwargs={"operation_id": operation.id}),
        )
        assert put_response.status_code == 200
        put_response_dict = put_response.json()
        assert put_response_dict.get("id") == str(operation.id)  # string representation of UUID
        operation_after_put = Operation.objects.get(id=operation.id)
        assert operation_after_put.status == Operation.Statuses.NOT_STARTED
        assert operation_after_put.verified_by is None
        assert operation_after_put.bc_obps_regulated_operation is None

        get_response = TestUtils.mock_get_with_auth_role(
            self, "cas_admin", custom_reverse_lazy("get_operation", kwargs={"operation_id": operation.id})
        )
        assert get_response.status_code == 200
        get_response_dict = get_response.json()
        assert get_response_dict.get("status") == "Not Started"
        assert get_response_dict.get("verified_at") is None

    def test_put_operation_update_status_invalid_data(self):
        operation = operation_baker()
        assert operation.status == Operation.Statuses.NOT_STARTED

        response = TestUtils.mock_put_with_auth_role(
            self,
            "cas_admin",
            self.content_type,
            {"status": "nonsense"},
            custom_reverse_lazy("update_operation_status", kwargs={"operation_id": operation.id}),
        )
        assert response.status_code == 400
        assert response.json().get('message') == "'nonsense' is not a valid Operation.Statuses"
