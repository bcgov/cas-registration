from django.forms import model_to_dict
import pytest
import json
from datetime import datetime
import pytz
from model_bakery import baker
from django.test import Client
from localflavor.ca.models import CAPostalCodeField
from registration.models import (
    NaicsCode,
    Document,
    Contact,
    Operation,
    Operator,
    ReportingActivity,
    User,
    UserOperator,
    RegulatedProduct,
    BusinessStructure,
)
from registration.schema import OperationCreateIn, OperationUpdateIn
from registration.utils import TestUtils

pytestmark = pytest.mark.django_db

# initialize the APIClient app
client = Client()

base_endpoint = "/api/registration/"

content_type_json = "application/json"

baker.generators.add(CAPostalCodeField, TestUtils.mock_postal_code)


class TestOperationsEndpoint:
    endpoint = base_endpoint + "operations"

    def setup(self):
        self.user: User = baker.make(User)
        self.auth_header = {'user_guid': str(self.user.user_guid)}
        self.auth_header_dumps = json.dumps(self.auth_header)

    def build_update_status_url(self, operation_id: int) -> str:
        return self.endpoint + "/" + str(operation_id) + "/update-status"

    def test_unauthorized_users_cannot_get(self, client):
        operation2700 = baker.make(Operation, id=2700)
        # /operations
        # unauthorized roles can't get
        response = TestUtils.mock_get_with_auth_role(self, "cas_pending")
        assert response.status_code == 401
        # /operations/{operation_id}
        response = TestUtils.mock_get_with_auth_role(self, "cas_pending", self.endpoint + "/" + str(operation2700.id))
        assert response.status_code == 401

        # unapproved industry users can't get
        # operations
        baker.make(UserOperator, user_id=self.user.user_guid, status=UserOperator.Statuses.PENDING)
        response = TestUtils.mock_get_with_auth_role(self, "industry_user")
        assert response.status_code == 401
        # /operations/{operation_id}
        response = TestUtils.mock_get_with_auth_role(self, "industry_user", self.endpoint + "/2700")
        assert response.status_code == 401

        # industry users that don't belong to the operator can't get
        # /operations
        operation3600 = baker.make(Operation, id=3600)
        response = TestUtils.mock_get_with_auth_role(self, "industry_user", self.endpoint + "/" + str(operation3600.id))
        assert response.status_code == 401

        # /operations/{operation_id}
        response = TestUtils.mock_get_with_auth_role(self, "industry_user", self.endpoint + "/" + str(operation3600.id))
        assert response.status_code == 401

    def test_unauthorized_roles_cannot_post(self, client):
        mock_operation = TestUtils.mock_OperationCreateIn(self)
        # IRC users can't post
        post_response = TestUtils.mock_post_with_auth_role(self, "cas_admin", content_type_json, mock_operation.json())
        assert post_response.status_code == 401
        post_response = post_response = TestUtils.mock_post_with_auth_role(
            self, "cas_analyst", content_type_json, mock_operation.json(), endpoint=None
        )
        assert post_response.status_code == 401
        post_response = post_response = TestUtils.mock_post_with_auth_role(
            self, "cas_pending", content_type_json, mock_operation.json()
        )
        assert post_response.status_code == 401

    def test_unauthorized_roles_cannot_put_operations(self, client):

        operation = baker.make(Operation)
        mock_operation = TestUtils.mock_OperationUpdateIn(self)
        # IRC users can't put
        response = TestUtils.mock_put_with_auth_role(
            self,
            'cas_pending',
            content_type_json,
            mock_operation.json(),
            self.endpoint + "/" + str(operation.id) + "?submit=false",
        )
        assert response.status_code == 401
        response = TestUtils.mock_put_with_auth_role(
            self,
            'cas_admin',
            content_type_json,
            mock_operation.json(),
            self.endpoint + "/" + str(operation.id) + "?submit=false",
        )
        assert response.status_code == 401
        response = TestUtils.mock_put_with_auth_role(
            self,
            'cas_analyst',
            content_type_json,
            mock_operation.json(),
            self.endpoint + "/" + str(operation.id) + "?submit=false",
        )
        assert response.status_code == 401
        # unapproved industry users cannot put
        response = TestUtils.mock_put_with_auth_role(
            self,
            'industry_user',
            content_type_json,
            mock_operation.json(),
            self.endpoint + "/" + str(operation.id) + "?submit=false",
        )
        assert response.status_code == 401
        response = TestUtils.mock_put_with_auth_role(
            self,
            'industry_user_admin',
            content_type_json,
            mock_operation.json(),
            self.endpoint + "/" + str(operation.id) + "?submit=false",
        )
        assert response.status_code == 401

    def test_unauthorized_users_cannot_update_status(self):
        operation = baker.make(Operation)

        url = self.build_update_status_url(operation_id=operation.id)

        response = TestUtils.mock_put_with_auth_role(
            self, "industry_user", content_type_json, {"status": "approved"}, url
        )
        assert response.status_code == 401
        response = TestUtils.mock_put_with_auth_role(
            self, "industry_user_admin", content_type_json, {"status": "approved"}, url
        )
        assert response.status_code == 401

    def test_get_method_for_200_status(self, client):
        # IRC users can get all operations
        response = TestUtils.mock_get_with_auth_role(self, "cas_admin")
        assert response.status_code == 200
        response = TestUtils.mock_get_with_auth_role(self, "cas_analyst")
        assert response.status_code == 200
        # industry users can only get their own company's operations, and only if they're approved
        baker.make(UserOperator, user_id=self.user.user_guid, status=UserOperator.Statuses.APPROVED)
        response = TestUtils.mock_get_with_auth_role(self, "industry_user")
        assert response.status_code == 200
        response = TestUtils.mock_get_with_auth_role(self, "industry_user_admin")
        assert response.status_code == 200

    def test_get_method_with_mock_data(self, client):
        # IRC users can get all operations except ones with a not registered status
        operator1 = baker.make(Operator)
        operator2 = baker.make(Operator)
        baker.make(Operation, operator_id=operator1.id, status=Operation.Statuses.PENDING)
        baker.make(Operation, operator_id=operator2.id, status=Operation.Statuses.APPROVED)
        baker.make(Operation, operator_id=operator2.id, status=Operation.Statuses.NOT_REGISTERED)
        response = TestUtils.mock_get_with_auth_role(self, "cas_admin")
        assert response.status_code == 200
        assert len(json.loads(response.content)) == 2
        response = TestUtils.mock_get_with_auth_role(self, "cas_analyst")
        assert response.status_code == 200
        assert len(json.loads(response.content)) == 2
        # industry users can only see their own company's operations, and only if they're approved
        baker.make(
            UserOperator, user_id=self.user.user_guid, status=UserOperator.Statuses.APPROVED, operator_id=operator1.id
        )
        response = TestUtils.mock_get_with_auth_role(self, "industry_user")
        assert response.status_code == 200
        assert len(json.loads(response.content)) == 1
        response = TestUtils.mock_get_with_auth_role(self, "industry_user_admin")
        assert response.status_code == 200
        assert len(json.loads(response.content)) == 1

    def test_authorized_roles_can_post_new_operation(self, client):

        operator = baker.make(Operator)
        mock_operation = TestUtils.mock_OperationCreateIn(self, operator)
        post_response = TestUtils.mock_post_with_auth_role(
            self, "industry_user", content_type_json, mock_operation.json()
        )
        assert post_response.status_code == 201
        assert post_response.json().get('name') == "Springfield Nuclear Power Plant"
        assert post_response.json().get('id') is not None
        baker.make(UserOperator, user_id=self.user.user_guid, status=UserOperator.Statuses.APPROVED, operator=operator)
        # check that the default status of pending was applied
        get_response = TestUtils.mock_get_with_auth_role(self, "industry_user").json()[0]
        assert 'status' in get_response and get_response['status'] == 'Not Registered'
        post_response = TestUtils.mock_post_with_auth_role(
            self, "industry_user_admin", content_type_json, mock_operation.json(), endpoint=None
        )
        assert post_response.status_code == 201

    def test_post_new_operation_with_multiple_operators(self, client):
        naics_code = baker.make(NaicsCode)
        document = baker.make(Document)
        contact = baker.make(Contact, postal_code='V1V 1V1')
        regulated_products = baker.make(RegulatedProduct, _quantity=2)
        reporting_activities = baker.make(ReportingActivity, _quantity=2)
        baker.make(BusinessStructure, name='BC Corporation')
        operator = baker.make(Operator)
        mock_operation = OperationCreateIn(
            name='Springfield Nuclear Power Plant',
            type='Single Facility Operation',
            naics_code_id=naics_code.id,
            operation_has_multiple_operators=True,
            multiple_operators_array=[
                {
                    "mo_legal_name": "test",
                    "mo_trade_name": "test",
                    "mo_cra_business_number": 123,
                    "mo_bc_corporate_registry_number": 'abc1234567',
                    "mo_business_structure": "BC Corporation",
                    "mo_website": "test",
                    "mo_physical_street_address": "test",
                    "mo_physical_municipality": "test",
                    "mo_physical_province": "BC",
                    "mo_physical_postal_code": "V1V 1V1",
                    "mo_mailing_address_same_as_physical": True,
                    "mo_mailing_street_address": "test",
                    "mo_mailing_municipality": "test",
                    "mo_mailing_province": "BC",
                    "mo_mailing_postal_code": "V1V 1V1",
                },
                {
                    "mo_legal_name": "test2",
                    "mo_trade_name": "test2",
                    "mo_cra_business_number": 123,
                    "mo_bc_corporate_registry_number": 'wer1234567',
                    "mo_business_structure": "BC Corporation",
                    "mo_website": "test",
                    "mo_physical_street_address": "test",
                    "mo_physical_municipality": "test",
                    "mo_physical_province": "BC",
                    "mo_physical_postal_code": "V1V 1V1",
                    "mo_mailing_address_same_as_physical": True,
                    "mo_mailing_street_address": "test",
                    "mo_mailing_municipality": "test",
                    "mo_mailing_province": "BC",
                    "mo_mailing_postal_code": "V1V 1V1",
                },
            ],
            reporting_activities=reporting_activities,
            regulated_products=regulated_products,
            documents=[document.id],
            contacts=[contact.id],
            operator_id=operator.id,
        )
        post_response = TestUtils.mock_post_with_auth_role(
            self, 'industry_user', content_type_json, mock_operation.json()
        )
        assert post_response.status_code == 201
        assert post_response.json().get('id') is not None
        baker.make(
            UserOperator, user_id=self.user.user_guid, status=UserOperator.Statuses.APPROVED, operator_id=operator.id
        )
        get_response = TestUtils.mock_get_with_auth_role(self, 'industry_user').json()[0]
        assert (
            'operation_has_multiple_operators' in get_response
            and get_response['operation_has_multiple_operators'] == True
        )
        assert 'multiple_operators_array' in get_response and len(get_response['multiple_operators_array']) == 2

    def test_post_new_malformed_operation(self, client):
        response = TestUtils.mock_post_with_auth_role(
            self, "industry_user", content_type_json, {"garbage": "i am bad data"}
        )
        assert response.status_code == 422

    def test_post_existing_operation(self, client):
        baker.make(Operation, bcghg_id=123)
        mock_operation2 = TestUtils.mock_OperationCreateIn(self)
        mock_operation2.bcghg_id = 123
        post_response = TestUtils.mock_post_with_auth_role(
            self, "industry_user", content_type_json, data=mock_operation2.json()
        )
        assert post_response.status_code == 400
        assert post_response.json().get('message') == "Operation with this BCGHG ID already exists."

    def test_put_operation_update_status_approved(self, client):
        operation = baker.make(Operation)
        assert operation.status == Operation.Statuses.NOT_REGISTERED

        url = self.build_update_status_url(operation_id=operation.id)

        now = datetime.now(pytz.utc)
        put_response = TestUtils.mock_put_with_auth_role(
            self, "cas_admin", content_type_json, {"status": "approved"}, url
        )
        assert put_response.status_code == 200
        put_response_content = json.loads(put_response.content.decode("utf-8"))
        parsed_list = json.loads(put_response_content)
        # the put_response content is returned as a list but there's only ever one object in the list
        parsed_object = parsed_list[0]
        assert parsed_object.get("pk") == operation.id
        assert parsed_object.get("fields").get("status") == "Approved"
        get_response = TestUtils.mock_get_with_auth_role(self, "cas_admin", self.endpoint + "/" + str(operation.id))
        assert get_response.status_code == 200
        get_response_dict = get_response.json()
        assert get_response_dict.get("status") == "Approved"
        now_as_string = now.strftime("%Y-%m-%d")
        assert get_response_dict.get("verified_at") == now_as_string

    def test_put_operation_update_status_rejected(self, client):
        operation = baker.make(Operation)
        assert operation.status == Operation.Statuses.NOT_REGISTERED

        url = self.build_update_status_url(operation_id=operation.id)

        now = datetime.now(pytz.utc)
        put_response = TestUtils.mock_put_with_auth_role(
            self, "cas_admin", content_type_json, {"status": "rejected"}, url
        )
        assert put_response.status_code == 200
        put_response_content = json.loads(put_response.content.decode("utf-8"))
        parsed_list = json.loads(put_response_content)
        # the put_response content is returned as a list but there's only ever one object in the list
        parsed_object = parsed_list[0]
        assert parsed_object.get("pk") == operation.id
        assert parsed_object.get("fields").get("status") == "Rejected"

        get_response = TestUtils.mock_get_with_auth_role(self, "cas_admin", self.endpoint + "/" + str(operation.id))
        assert get_response.status_code == 200
        get_response_dict = get_response.json()
        assert get_response_dict.get("status") == "Rejected"
        now_as_string = now.strftime("%Y-%m-%d")
        assert get_response_dict.get("verified_at") == now_as_string

    def test_put_operation_not_verified_when_not_registered(self, client):
        operation = baker.make(Operation)
        assert operation.status == Operation.Statuses.NOT_REGISTERED

        url = self.build_update_status_url(operation_id=operation.id)

        put_response = TestUtils.mock_put_with_auth_role(
            self, "cas_admin", content_type_json, {"status": "not_registered"}, url
        )
        assert put_response.status_code == 200
        put_response_content = json.loads(put_response.content.decode("utf-8"))
        parsed_list = json.loads(put_response_content)
        # the put_response content is returned as a list but there's only ever one object in the list
        parsed_object = parsed_list[0]
        assert parsed_object.get("pk") == operation.id
        assert parsed_object.get("fields").get("status") == "Not Registered"

        get_response = TestUtils.mock_get_with_auth_role(self, "cas_admin", self.endpoint + "/" + str(operation.id))
        assert get_response.status_code == 200
        get_response_dict = get_response.json()
        assert get_response_dict.get("status") == "Not Registered"
        assert get_response_dict.get("verified_at") is None

    def test_put_operation_update_status_invalid_data(self, client):
        def send_put_invalid_data():
            operation = baker.make(Operation)
            assert operation.status == Operation.Statuses.NOT_REGISTERED

            url = self.build_update_status_url(operation_id=operation.id)

            TestUtils.mock_put_with_auth_role(self, "cas_admin", content_type_json, {"status": "nonsense"}, url)

        with pytest.raises(AttributeError):
            send_put_invalid_data()

    def test_put_nonexistant_operation(self, client):
        response = TestUtils.mock_get_with_auth_role(self, 'industry_user', self.endpoint + "1")
        client.get(self.endpoint + "1")
        assert response.status_code == 404

    def test_put_operation_without_submit(self, client):
        operator = baker.make(Operator)
        operation = baker.make(Operation)
        mock_operation = TestUtils.mock_OperationUpdateIn(self)
        # approve the user
        baker.make(
            UserOperator, user_id=self.user.user_guid, status=UserOperator.Statuses.APPROVED, operator_id=operator.id
        )
        response = TestUtils.mock_put_with_auth_role(
            self,
            'industry_user',
            content_type_json,
            mock_operation.json(),
            self.endpoint + "/" + str(operation.id) + "?submit=false",
        )
        assert response.status_code == 200
        assert response.json() == {"name": "New name"}

        get_response = TestUtils.mock_get_with_auth_role(
            self, "industry_user", self.endpoint + "/" + str(operation.id)
        ).json()
        assert get_response["status"] == Operation.Statuses.NOT_REGISTERED

    def test_put_operation_with_submit(self, client):
        operator = baker.make(Operator)
        operation = baker.make(Operation, id=5)

        mock_operation = TestUtils.mock_OperationUpdateIn(self)
        baker.make(
            UserOperator, user_id=self.user.user_guid, status=UserOperator.Statuses.APPROVED, operator_id=operator.id
        )
        response = TestUtils.mock_put_with_auth_role(
            self,
            'industry_user',
            content_type_json,
            mock_operation.json(),
            self.endpoint + "/" + str(operation.id) + "?submit=true",
        )

        assert response.status_code == 200
        assert response.json() == {"name": "New name"}

        get_response = TestUtils.mock_get_with_auth_role(
            self, "industry_user", self.endpoint + "/" + str(operation.id)
        ).json()
        assert get_response["status"] == Operation.Statuses.PENDING

    def test_put_malformed_operation(self, client):
        operation = baker.make(Operation)
        response = TestUtils.mock_put_with_auth_role(
            self,
            'industry_user',
            content_type_json,
            {"garbage": "i am bad data"},
            self.endpoint + "/" + str(operation.id) + "?submit=false",
        )

        assert response.status_code == 422

    def test_put_operation_with_application_lead(self, client):
        contact1 = baker.make(Contact)
        contact2 = baker.make(Contact, email=contact1.email)
        operation = baker.make(Operation)

        operator = baker.make(Operator)
        update = OperationUpdateIn(
            name='Springfield Nuclear Power Plant',
            type='Single Facility Operation',
            naics_code_id=operation.naics_code_id,
            reporting_activities=[],
            regulated_products=[],
            operation_has_multiple_operators=False,
            documents=[],
            application_lead=contact2.id,
            operator_id=operator.id,
        )
        TestUtils.authorize_current_user_as_operator_user(self, operator)
        put_response = TestUtils.mock_put_with_auth_role(
            self,
            'industry_user',
            content_type_json,
            update.json(),
            self.endpoint + '/' + str(operation.id) + "?submit=true",
        )
        assert put_response.status_code == 200

        # this checks that we added a new contact instead of updating the existing one even though they have the same email
        assert len(Contact.objects.all()) == 2
