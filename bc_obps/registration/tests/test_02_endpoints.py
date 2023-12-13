from django.forms import model_to_dict
import pytest
import json
from datetime import datetime
import pytz
from model_bakery import baker
from django.test import Client
from localflavor.ca.models import CAPostalCodeField
from registration.models import (
    BusinessStructure,
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
from registration.schema import OperationCreateIn, OperationUpdateIn, UserIn

import uuid
from django.core.management import call_command


@pytest.fixture(scope='function')
def app_role_fixture():
    # Load the fixture data into the test database
    call_command('loaddata', 'real/appRole.json')


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
            operation_has_multiple_operators=False,
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

    def test_post_new_operation_with_multiple_operators(self, client):
        naics_code = baker.make(NaicsCode)
        document = baker.make(Document)
        contact = baker.make(Contact, postal_code='V1V 1V1')
        baker.make(BusinessStructure, name='BC Corporation')
        regulated_products = baker.make(RegulatedProduct, _quantity=2)
        reporting_activities = baker.make(ReportingActivity, _quantity=2)
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
            ],
            reporting_activities=reporting_activities,
            regulated_products=regulated_products,
            documents=[document.id],
            contacts=[contact.id],
            operator_id=operator.id,
        )
        post_response = client.post(self.endpoint, content_type=content_type_json, data=mock_operation.json())
        assert post_response.status_code == 201
        assert post_response.json().get('id') is not None

        get_response = client.get(self.endpoint).json()[0]
        print(get_response)
        assert (
            'operation_has_multiple_operators' in get_response
            and get_response['operation_has_multiple_operators'] == True
        )
        assert 'multiple_operators_array' in get_response and len(get_response['multiple_operators_array']) == 2

    def test_post_new_malformed_operation(self, client):
        response = client.post(
            self.endpoint,
            content_type=content_type_json,
            data={"garbage": "i am bad data"},
        )
        assert response.status_code == 422

    def test_post_existing_operation(self, client):
        baker.make(Operation, bcghg_id='123')
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
            bcghg_id='123',
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
        self.user: User = baker.make(User)
        self.auth_header = {'user_guid': str(self.user.user_guid)}
        self.auth_header_dumps = json.dumps(self.auth_header)

    def test_get_operators_no_parameters(self):
        response = client.get(self.endpoint)
        assert response.status_code == 404
        assert response.json() == {"message": "No parameters provided"}

    def test_get_operators_by_legal_name(self):
        response = client.get(
            self.endpoint + "?legal_name=Test Operator legal name", HTTP_AUTHORIZATION=self.auth_header_dumps
        )
        assert response.status_code == 200
        assert response.json() == model_to_dict(self.operator)

    def test_get_operators_by_cra_number(self):
        response = client.get(
            self.endpoint + "?cra_business_number=123456789", HTTP_AUTHORIZATION=self.auth_header_dumps
        )
        assert response.status_code == 200
        assert response.json() == model_to_dict(self.operator)

    def test_get_operators_no_matching_operator_legal_name(self):
        response = client.get(
            self.endpoint + "?legal_name=Test Operator legal name 2", HTTP_AUTHORIZATION=self.auth_header_dumps
        )
        assert response.status_code == 404
        assert response.json() == {"message": "No matching operator found. Retry or add operator."}

    def test_get_operators_no_matching_operator_cra_number(self):
        response = client.get(
            self.endpoint + "?cra_business_number=987654321", HTTP_AUTHORIZATION=self.auth_header_dumps
        )
        assert response.status_code == 404
        assert response.json() == {"message": "No matching operator found. Retry or add operator."}


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

    # GET USER OPERATOR ID
    def test_get_user_operator_operator_id(self):

        # Act
        mock_user = baker.make(User)
        baker.make(UserOperator, role="admin", status="approved", user_id=mock_user.user_guid)
        response = client.get(
            f"{base_endpoint}user-operator-operator-id",
            HTTP_AUTHORIZATION=json.dumps({'user_guid': str(mock_user.user_guid)}),
        )
        response_json = response.json()

        # Assert
        assert response.status_code == 200

        # Additional Assertions
        assert "operator_id" in response_json

    def test_get_user_operator_operator_id_with_invalid_user(self):

        # Act
        invalid_user = "98f255ed8d4644eeb2fe9f8d3d92c689"
        response = client.get(
            f"{base_endpoint}user-operator-operator-id",
            HTTP_AUTHORIZATION=json.dumps({'user_guid': invalid_user}),
        )
        response_json = response.json()

        # Assert
        assert response.status_code == 404

        # Additional Assertions
        assert response_json == {"detail": "Not Found"}


class TestUserEndpoint:
    endpoint = base_endpoint + "user"
    endpoint_profile = endpoint + "-profile"

    def setup_method(self):
        self.user: User = baker.make(User)
        self.auth_header = {'user_guid': str(self.user.user_guid)}
        self.auth_header_dumps = json.dumps(self.auth_header)

    # GET USER
    def test_get_user(self):
        # Act
        response = client.get(self.endpoint, HTTP_AUTHORIZATION=self.auth_header_dumps)
        content = response.json()

        # Assert
        assert response.status_code == 200

        # Additional Assertions
        assert 'first_name' in content and isinstance(content['first_name'], str) and content['first_name'] != ''
        assert 'last_name' in content and isinstance(content['last_name'], str) and content['last_name'] != ''
        assert (
            'position_title' in content
            and isinstance(content['position_title'], str)
            and content['position_title'] != ''
        )
        assert 'email' in content and isinstance(content['email'], str) and '@' in content['email']
        assert (
            'street_address' in content
            and isinstance(content['street_address'], str)
            and content['street_address'] != ''
        )
        assert 'municipality' in content and isinstance(content['municipality'], str) and content['municipality'] != ''
        assert 'province' in content and isinstance(content['province'], str) and content['province'] != ''
        assert 'postal_code' in content and isinstance(content['postal_code'], str) and content['postal_code'] != ''

        # Additional Assertion for user_guid
        assert 'user_guid' not in content

    # GET USER PROFILE
    def test_get_user_profile(self):
        # Arrange
        url = f"{self.endpoint_profile}"

        # Act
        response = client.get(url, HTTP_AUTHORIZATION=self.auth_header_dumps)
        content = response.json()

        # Assert
        assert response.status_code == 200

        # Additional Assertions
        assert 'first_name' in content and isinstance(content['first_name'], str) and content['first_name'] != ''
        assert 'last_name' in content and isinstance(content['last_name'], str) and content['last_name'] != ''
        assert (
            'position_title' in content
            and isinstance(content['position_title'], str)
            and content['position_title'] != ''
        )
        assert 'email' in content and isinstance(content['email'], str) and '@' in content['email']
        assert 'phone_number' in content and isinstance(content['phone_number'], str)

        # Additional Assertion for user_guid
        assert 'user_guid' not in content

    # POST USER PROFILE BCEIDBUSINESS
    @pytest.mark.usefixtures('app_role_fixture')
    def test_create_user_profile_bceidbusiness(self):
        # Arrange
        mock_payload = UserIn(
            first_name='Bceid',
            last_name='User',
            email='bceid.user@email.com',
            phone_number='123456789',
            position_title='Tester',
        )

        # Act
        # Construct the endpoint URL for identity_provider "bceidbusiness"
        response = client.post(
            f"{self.endpoint_profile}/{User.IdPs.BCEIDBUSINESS.value}",
            content_type=content_type_json,
            data=mock_payload.json(),
            HTTP_AUTHORIZATION=json.dumps({'user_guid': str(uuid.uuid4())}),
        )
        content = response.json()

        # Assert
        assert response.status_code == 200

        # Additional Assertions
        assert 'app_role' in content and content["app_role"]["role_name"] == "industry_user"
        assert 'first_name' in content and isinstance(content['first_name'], str) and content['first_name'] == 'Bceid'
        assert 'last_name' in content and isinstance(content['last_name'], str) and content['last_name'] == 'User'
        assert (
            'position_title' in content
            and isinstance(content['position_title'], str)
            and content['position_title'] == 'Tester'
        )
        assert 'email' in content and isinstance(content['email'], str) and content['email'] == 'bceid.user@email.com'
        assert 'phone_number' in content and isinstance(content['phone_number'], str)

        # Additional Assertion for user_guid
        assert 'user_guid' not in content

    # POST USER PROFILE IDIR
    @pytest.mark.usefixtures('app_role_fixture')
    def test_create_user_profile_idir(self):
        # Arrange
        mock_payload = UserIn(
            first_name='Idir',
            last_name='User',
            email='idir.user@email.com',
            phone_number='987654321',
            position_title='Tester',
        )

        # Act
        # Construct the endpoint URL for identity_provider "idir"
        response = client.post(
            f"{self.endpoint_profile}/{User.IdPs.IDIR.value}",
            content_type=content_type_json,
            data=mock_payload.json(),
            HTTP_AUTHORIZATION=json.dumps({'user_guid': str(uuid.uuid4())}),
        )
        content = response.json()

        # Assert
        assert response.status_code == 200

        # Additional Assertions
        assert 'app_role' in content and content["app_role"]["role_name"] == "cas_pending"
        assert 'first_name' in content and isinstance(content['first_name'], str) and content['first_name'] == 'Idir'
        assert 'last_name' in content and isinstance(content['last_name'], str) and content['last_name'] == 'User'
        assert (
            'position_title' in content
            and isinstance(content['position_title'], str)
            and content['position_title'] == 'Tester'
        )
        assert 'email' in content and isinstance(content['email'], str) and content['email'] == 'idir.user@email.com'
        assert 'phone_number' in content and isinstance(content['phone_number'], str)

        # Additional Assertion for user_guid
        assert 'user_guid' not in content

    # PUT USER PROFILE
    def test_update_user_profile(self):
        # Arrange
        mock_payload = UserIn(
            first_name='Test',
            last_name='User',
            email='test.user@email.com',
            phone_number='123459876',
            position_title='Boss',
        )

        # Act
        response = client.put(
            f"{self.endpoint_profile}",
            content_type=content_type_json,
            data=mock_payload.json(),
            HTTP_AUTHORIZATION=self.auth_header_dumps,
        )
        content = response.json()

        # Assert
        assert response.status_code == 200

        # Additional Assertions
        assert 'first_name' in content and isinstance(content['first_name'], str) and content['first_name'] == 'Test'
        assert 'last_name' in content and isinstance(content['last_name'], str) and content['last_name'] == 'User'
        assert (
            'position_title' in content
            and isinstance(content['position_title'], str)
            and content['position_title'] == 'Boss'
        )
        assert 'email' in content and isinstance(content['email'], str) and content['email'] == 'test.user@email.com'
        assert 'phone_number' in content and isinstance(content['phone_number'], str)

        # Additional Assertion for user_guid
        assert 'user_guid' not in content
