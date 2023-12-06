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
    HistoricalOperation,
    HistoricalUserOperator,
)
from registration.schema import OperationCreateIn, OperationUpdateIn

pytestmark = pytest.mark.django_db

# initialize the APIClient app
client = Client()

base_endpoint = "/api/registration/"

content_type_json = "application/json"


def mock_postal_code():
    return "v8v3g1"


baker.generators.add(CAPostalCodeField, mock_postal_code)


class TestNaicsCodeEndpoint:
    endpoint = base_endpoint + "naics_codes"

    def test_get_method_for_200_status(self, client):
        response = client.get(self.endpoint)
        assert response.status_code == 200

    def test_get_method_with_mock_data(self, client):
        baker.make(NaicsCode, _quantity=2)

        response = client.get(self.endpoint)
        assert response.status_code == 200
        assert len(json.loads(response.content)) == 2


class TestRegulatedProductsEndpoint:
    endpoint = base_endpoint + "regulated_products"

    def test_get_method_for_200_status(self, client):
        response = client.get(self.endpoint)
        assert response.status_code == 200

    def test_get_method_with_mock_data(self, client):
        baker.make(RegulatedProduct, _quantity=4)

        response = client.get(self.endpoint)
        assert response.status_code == 200
        assert len(json.loads(response.content)) == 4


class TestReportingActivitiesEndpoint:
    endpoint = base_endpoint + "reporting_activities"

    def test_get_method_for_200_status(self, client):
        response = client.get(self.endpoint)
        assert response.status_code == 200

    def test_get_method_with_mock_data(self, client):
        baker.make(ReportingActivity, _quantity=4)

        response = client.get(self.endpoint)
        assert response.status_code == 200
        assert len(json.loads(response.content)) == 4


class TestOperationsEndpoint:
    endpoint = base_endpoint + "operations"

    def build_update_status_url(self, operation_id: int) -> str:
        return self.endpoint + "/" + str(operation_id) + "/update-status"

    def test_get_method_for_200_status(self, client):
        response = client.get(self.endpoint)
        assert response.status_code == 200

    def test_get_method_with_mock_data(self, client):
        baker.make(Operation, _quantity=1)
        response = client.get(self.endpoint)
        assert response.status_code == 200
        assert len(json.loads(response.content)) == 1

    def test_post_new_operation(self, client):
        naics_code = baker.make(NaicsCode)
        document = baker.make(Document)
        reporting_activities = baker.make(ReportingActivity, _quantity=2)
        regulated_products = baker.make(RegulatedProduct, _quantity=2)
        application_lead = baker.make(Contact)
        operator = baker.make(Operator)
        mock_operation = OperationCreateIn(
            name='Springfield Nuclear Power Plant',
            type='Single Facility Operation',
            naics_code_id=naics_code.id,
            reporting_activities=reporting_activities,
            regulated_products=regulated_products,
            documents=[document.id],
            application_lead=application_lead.id,
            operator_id=operator.id,
        )
        post_response = client.post(self.endpoint, content_type=content_type_json, data=mock_operation.json())
        assert post_response.status_code == 201
        assert post_response.json().get('name') == "Springfield Nuclear Power Plant"
        assert post_response.json().get('id') is not None
        # check that the default status of pending was applied
        get_response = client.get(self.endpoint).json()[0]
        assert 'status' in get_response and get_response['status'] == 'Not Registered'

    def test_post_new_malformed_operation(self, client):
        response = client.post(
            self.endpoint,
            content_type=content_type_json,
            data={"garbage": "i am bad data"},
        )
        assert response.status_code == 422

    def test_post_existing_operation(self, client):
        baker.make(Operation, bcghg_id=123)
        naics_code = baker.make(NaicsCode)
        document = baker.make(Document)
        reporting_activities = baker.make(ReportingActivity, _quantity=2)
        regulated_products = baker.make(RegulatedProduct, _quantity=2)
        application_lead = baker.make(Contact)
        operator = baker.make(Operator)
        mock_operation2 = OperationCreateIn(
            name='Springfield Nuclear Power Plant',
            type='Single Facility Operation',
            naics_code_id=naics_code.id,
            reporting_activities=reporting_activities,
            regulated_products=regulated_products,
            documents=[document.id],
            application_lead=application_lead.id,
            operator_id=operator.id,
            bcghg_id=123,
        )
        post_response = client.post(self.endpoint, content_type=content_type_json, data=mock_operation2.json())
        assert post_response.status_code == 400
        assert post_response.json().get('message') == "Operation with this BCGHG ID already exists."

    def test_put_operation_update_status_approved(self, client):
        operation = baker.make(Operation)
        assert operation.status == Operation.Statuses.NOT_REGISTERED

        url = self.build_update_status_url(operation_id=operation.id)

        now = datetime.now(pytz.utc)
        put_response = client.put(url, content_type=content_type_json, data={"status": "approved"})
        assert put_response.status_code == 200
        put_response_content = json.loads(put_response.content.decode("utf-8"))
        parsed_list = json.loads(put_response_content)
        # the put_response content is returned as a list but there's only ever one object in the list
        parsed_object = parsed_list[0]
        assert parsed_object.get("pk") == operation.id
        assert parsed_object.get("fields").get("status") == "Approved"

        get_response = client.get(self.endpoint + "/" + str(operation.id))
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
        put_response = client.put(url, content_type=content_type_json, data={"status": "rejected"})
        assert put_response.status_code == 200
        put_response_content = json.loads(put_response.content.decode("utf-8"))
        parsed_list = json.loads(put_response_content)
        # the put_response content is returned as a list but there's only ever one object in the list
        parsed_object = parsed_list[0]
        assert parsed_object.get("pk") == operation.id
        assert parsed_object.get("fields").get("status") == "Rejected"

        get_response = client.get(self.endpoint + "/" + str(operation.id))
        assert get_response.status_code == 200
        get_response_dict = get_response.json()
        assert get_response_dict.get("status") == "Rejected"
        now_as_string = now.strftime("%Y-%m-%d")
        assert get_response_dict.get("verified_at") == now_as_string

    def test_put_operation_not_verified_when_not_registered(self, client):
        operation = baker.make(Operation)
        assert operation.status == Operation.Statuses.NOT_REGISTERED

        url = self.build_update_status_url(operation_id=operation.id)

        put_response = client.put(url, content_type=content_type_json, data={"status": "not_registered"})
        assert put_response.status_code == 200
        put_response_content = json.loads(put_response.content.decode("utf-8"))
        parsed_list = json.loads(put_response_content)
        # the put_response content is returned as a list but there's only ever one object in the list
        parsed_object = parsed_list[0]
        assert parsed_object.get("pk") == operation.id
        assert parsed_object.get("fields").get("status") == "Not Registered"

        get_response = client.get(self.endpoint + "/" + str(operation.id))
        assert get_response.status_code == 200
        get_response_dict = get_response.json()
        assert get_response_dict.get("status") == "Not Registered"
        assert get_response_dict.get("verified_at") is None

    def test_put_operation_update_status_invalid_data(self, client):
        def send_put_invalid_data():
            operation = baker.make(Operation)
            assert operation.status == Operation.Statuses.NOT_REGISTERED

            url = self.build_update_status_url(operation_id=operation.id)

            client.put(url, content_type=content_type_json, data={"status": "nonsense"})

        with pytest.raises(AttributeError):
            send_put_invalid_data()


class TestOperationEndpoint:
    endpoint = base_endpoint + "operations/"

    def test_put_nonexistant_operation(self, client):
        response = client.get(self.endpoint + "1")
        assert response.status_code == 404

    def test_get_method_for_200_status(self, client):
        baker.make(NaicsCode)
        baker.make(Operator)
        operation = baker.make(Operation)
        response = client.get(self.endpoint + str(operation.id))
        assert response.status_code == 200

    def test_put_operation_without_submit(self, client):
        naics_code = baker.make(NaicsCode)
        document = baker.make(Document)
        application_lead = baker.make(Contact)
        operator = baker.make(Operator)
        activity = baker.make(ReportingActivity)
        product = baker.make(RegulatedProduct)
        operation = baker.make(Operation)
        operation.reporting_activities.set([activity.id])
        operation.regulated_products.set([product.id])

        mock_operation = OperationUpdateIn(
            name="New name",
            type="Single Facility Operation",
            naics_code_id=naics_code.id,
            reporting_activities=[activity.id],
            physical_street_address="19 Evergreen Terrace",
            physical_municipality="Springfield",
            physical_province="BC",
            physical_postal_code="V1V 1V1",
            legal_land_description="It's legal",
            latitude=90,
            longitude=-120,
            regulated_products=[product.id],
            documents=[document.id],
            application_lead=application_lead.id,
            operator_id=operator.id,
        )

        response = client.put(
            self.endpoint + str(operation.id) + "?submit=false",
            content_type=content_type_json,
            data=mock_operation.json(),
        )
        assert response.status_code == 200
        assert response.json() == {"name": "New name"}

        get_response = client.get(self.endpoint + str(operation.id)).json()
        assert get_response["status"] == Operation.Statuses.NOT_REGISTERED

    def test_put_operation_with_submit(self, client):
        naics_code = baker.make(NaicsCode)
        document = baker.make(Document)
        application_lead = baker.make(Contact)
        operator = baker.make(Operator)
        activity = baker.make(ReportingActivity)
        product = baker.make(RegulatedProduct)
        operation = baker.make(Operation)
        operation.reporting_activities.set([activity.id])
        operation.regulated_products.set([product.id])

        mock_operation = OperationUpdateIn(
            name="New name",
            type="Single Facility Operation",
            naics_code_id=naics_code.id,
            reporting_activities=[activity.id],
            regulated_products=[product.id],
            documents=[document.id],
            application_lead=application_lead.id,
            operator_id=operator.id,
        )

        response = client.put(
            self.endpoint + str(operation.id) + "?submit=true",
            content_type=content_type_json,
            data=mock_operation.json(),
        )
        assert response.status_code == 200
        assert response.json() == {"name": "New name"}

        get_response = client.get(self.endpoint + str(operation.id)).json()
        assert get_response["status"] == Operation.Statuses.PENDING
        has_history_record = HistoricalOperation.objects.all()
        assert has_history_record.count() > 0, "History record was not created"

    def test_put_malformed_operation(self, client):
        operation = baker.make(Operation)
        response = client.put(
            self.endpoint + str(operation.id) + "?submit=false",
            content_type=content_type_json,
            data={"garbage": "i am bad data"},
        )
        assert response.status_code == 422


class TestOperatorsEndpoint:
    endpoint = base_endpoint + "operators"

    def setup(self):
        self.operator = baker.make(Operator, legal_name="Test Operator legal name", cra_business_number=123456789)

    def test_get_operators_no_parameters(self):
        response = client.get(self.endpoint)
        assert response.status_code == 404
        assert response.json() == {"message": "No parameters provided"}

    def test_get_operators_by_legal_name(self):
        response = client.get(self.endpoint + "?legal_name=Test Operator legal name")
        assert response.status_code == 200
        assert response.json() == model_to_dict(self.operator)

    def test_get_operators_by_cra_number(self):
        response = client.get(self.endpoint + "?cra_business_number=123456789")
        assert response.status_code == 200
        assert response.json() == model_to_dict(self.operator)

    def test_get_operators_no_matching_operator(self):
        response = client.get(self.endpoint + "?legal_name=Test Operator legal name 2")
        assert response.status_code == 404
        assert response.json() == {"message": "No matching operator found"}


class TestUserOperatorEndpoint:
    select_endpoint = base_endpoint + "select-operator"
    operator_endpoint = base_endpoint + "operators"

    def setup(self):
        self.user: User = baker.make(User)
        self.auth_header = {'user_guid': str(self.user.user_guid)}
        self.auth_header_dumps = json.dumps(self.auth_header)

    def test_select_operator_with_valid_id(self):
        operators = baker.make(Operator, _quantity=1)
        response = client.get(f"{self.operator_endpoint}/{operators[0].id}", HTTP_AUTHORIZATION=self.auth_header_dumps)

        assert response.status_code == 200
        assert response.json()['id'] == operators[0].id

    def test_select_operator_with_invalid_id(self):
        invalid_operator_id = 99999  # Invalid operator ID

        response = client.get(
            f"{self.operator_endpoint}/{invalid_operator_id}", HTTP_AUTHORIZATION=self.auth_header_dumps
        )

        assert response.status_code == 404
        assert response.json() == {"message": "No matching operator found"}

    def test_request_admin_access_with_valid_payload(self):
        operator = baker.make(Operator)
        response = client.post(
            f"{self.select_endpoint}/request-admin-access",
            content_type=content_type_json,
            data={"operator_id": operator.id},
            HTTP_AUTHORIZATION=self.auth_header_dumps,
        )

        response_json = response.json()

        assert response.status_code == 201
        assert "user_operator_id" in response_json

        user_operator_exists = UserOperator.objects.filter(
            id=response_json["user_operator_id"],
            user=self.user,
            operator=operator,
            status=UserOperator.Statuses.DRAFT,
            role=UserOperator.Roles.ADMIN,
        ).exists()

        assert user_operator_exists, "UserOperator object was not created"

    def test_request_access_with_invalid_payload(self):
        invalid_payload = {"operator_id": 99999}  # Invalid operator ID

        response = client.post(
            f"{self.select_endpoint}/request-admin-access",
            content_type=content_type_json,
            data=invalid_payload,
            HTTP_AUTHORIZATION=self.auth_header_dumps,
        )

        assert response.status_code == 404
        assert response.json() == {"detail": "Not Found"}

    def test_is_approved_admin_user_operator_with_approved_user(self):
        mock_user = baker.make(User)
        mock_user_operator = baker.make(UserOperator, role="admin", status="approved", user_id=mock_user.user_guid)
        response = client.get(
            f"{base_endpoint}is-approved-admin-user-operator/{mock_user_operator.user_id}",
            HTTP_AUTHORIZATION=self.auth_header_dumps,
        )

        assert response.status_code == 200
        assert response.json() == {"approved": True}

    def test_is_approved_admin_user_operator_without_approved_user(self):
        mock_user = baker.make(User)
        mock_user_operator = baker.make(UserOperator, role="admin", status="pending", user_id=mock_user.user_guid)
        response = client.get(
            f"{base_endpoint}is-approved-admin-user-operator/{mock_user_operator.user_id}",
            HTTP_AUTHORIZATION=self.auth_header_dumps,
        )

        assert response.status_code == 200
        assert response.json() == {"approved": False}

    def test_request_subsequent_access_with_valid_payload(self):
        operator = baker.make(Operator)
        admin_user = baker.make(User, business_guid=self.user.business_guid)
        baker.make(
            UserOperator,
            user=admin_user,
            operator=operator,
            role=UserOperator.Roles.ADMIN,
            status=UserOperator.Statuses.APPROVED,
        )
        response = client.post(
            f"{self.select_endpoint}/request-access",
            content_type=content_type_json,
            data={"operator_id": operator.id},
            HTTP_AUTHORIZATION=self.auth_header_dumps,
        )

        response_json = response.json()

        assert response.status_code == 201
        assert "user_operator_id" in response_json

        user_operator_exists = UserOperator.objects.filter(
            id=response_json["user_operator_id"],
            user=self.user,
            operator=operator,
            status=UserOperator.Statuses.PENDING,
        ).exists()

        assert user_operator_exists, "UserOperator object was not created"

        has_history_record = HistoricalUserOperator.objects.all()
        assert has_history_record.count() > 0, "History record was not created"
