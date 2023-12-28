import pytest, json, pytz
from datetime import datetime
from model_bakery import baker
from django.test import Client
from localflavor.ca.models import CAPostalCodeField
from registration.models import (
    AppRole,
    NaicsCode,
    Document,
    Contact,
    Operation,
    Operator,
    ReportingActivity,
    UserOperator,
    RegulatedProduct,
    BusinessStructure,
)
from registration.schema import OperationCreateIn, OperationUpdateIn
from registration.tests.utils.helpers import CommonTestSetup, TestUtils

pytestmark = pytest.mark.django_db

# initialize the APIClient app
client = Client()

base_endpoint = "/api/registration/"

content_type_json = "application/json"

baker.generators.add(CAPostalCodeField, TestUtils.mock_postal_code)


class TestOperationsEndpoint(CommonTestSetup):
    endpoint = base_endpoint + "operations"

    def build_update_status_url(self, operation_id: int) -> str:
        return self.endpoint + "/" + str(operation_id) + "/update-status"

    # AUTHORIZATION
    def test_unauthorized_users_cannot_get(self):
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

    def test_unauthorized_roles_cannot_post(self):
        mock_operation = TestUtils.mock_OperationCreateIn()
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

    def test_unauthorized_roles_cannot_put_operations(self):

        operation = baker.make(Operation)
        mock_operation = TestUtils.mock_OperationUpdateIn()
        # IRC users can't put
        roles = ['cas_pending', 'cas_admin', 'cas_analyst', 'industry_user', 'industry_user_admin']
        # unapproved industry users cannot put
        for role in roles:
            response = TestUtils.mock_put_with_auth_role(
                self,
                role,
                content_type_json,
                mock_operation.json(),
                self.endpoint + "/" + str(operation.id) + "?submit=false",
            )
            assert response.status_code == 401

    def test_unauthorized_users_cannot_update_status(self):
        operation = baker.make(Operation)

        url = self.build_update_status_url(operation_id=operation.id)

        for role in AppRole.get_industry_roles():
            response = TestUtils.mock_put_with_auth_role(self, role, content_type_json, {"status": "approved"}, url)
            assert response.status_code == 401

    # GET
    def test_get_method_for_200_status(self):
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

    def test_get_method_for_invalid_operation_id(self):
        response = TestUtils.mock_get_with_auth_role(self, endpoint=self.endpoint + "/99999", role_name="cas_admin")
        assert response.status_code == 404
        assert response.json().get('detail') == "Not Found"

    def test_get_method_with_mock_data(self):
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

    # POST
    def test_authorized_roles_can_post_new_operation(self):

        operator = baker.make(Operator)
        mock_operation = TestUtils.mock_OperationCreateIn(operator)
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

    def test_post_new_operation_with_multiple_operators(self):
        naics_code = baker.make(NaicsCode)
        document = baker.make(Document)
        contact = baker.make(Contact)
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

    def test_post_new_malformed_operation(self):
        response = TestUtils.mock_post_with_auth_role(
            self, "industry_user", content_type_json, {"garbage": "i am bad data"}
        )
        assert response.status_code == 422

    def test_post_existing_operation(self):
        baker.make(Operation, bcghg_id=123)
        mock_operation2 = TestUtils.mock_OperationCreateIn()
        mock_operation2.bcghg_id = 123
        post_response = TestUtils.mock_post_with_auth_role(
            self, "industry_user", content_type_json, data=mock_operation2.json()
        )
        assert post_response.status_code == 400
        assert post_response.json().get('message') == "Operation with this BCGHG ID already exists."

    # PUT
    def test_put_operation_update_invalid_operation_id(self):
        url = self.build_update_status_url(operation_id=99999999999)
        put_response = TestUtils.mock_put_with_auth_role(
            self, "cas_admin", content_type_json, {"status": "approved"}, url
        )
        assert put_response.status_code == 404
        assert put_response.json().get('detail') == "Not Found"

    def test_put_operation_update_status_approved(self):
        operation = baker.make(Operation)
        assert operation.status == Operation.Statuses.NOT_REGISTERED

        url = self.build_update_status_url(operation_id=operation.id)

        now = datetime.now(pytz.utc)
        put_response = TestUtils.mock_put_with_auth_role(
            self, "cas_admin", content_type_json, {"status": "Approved"}, url
        )
        assert put_response.status_code == 200
        put_response_dict = put_response.json()
        assert put_response_dict.get("id") == operation.id
        assert put_response_dict.get("status") == "Approved"
        assert put_response_dict.get("verified_by") == str(self.user.user_guid)
        assert put_response_dict.get("bc_obps_regulated_operation") is not None

        get_response = TestUtils.mock_get_with_auth_role(self, "cas_admin", self.endpoint + "/" + str(operation.id))
        assert get_response.status_code == 200
        get_response_dict = get_response.json()
        assert get_response_dict.get("status") == "Approved"
        now_as_string = now.strftime("%Y-%m-%d")
        assert get_response_dict.get("verified_at") == now_as_string

    def test_put_operation_update_status_rejected(self):
        operation = baker.make(Operation)
        assert operation.status == Operation.Statuses.NOT_REGISTERED

        url = self.build_update_status_url(operation_id=operation.id)

        now = datetime.now(pytz.utc)
        put_response = TestUtils.mock_put_with_auth_role(
            self, "cas_admin", content_type_json, {"status": "Rejected"}, url
        )
        assert put_response.status_code == 200
        put_response_dict = put_response.json()
        assert put_response_dict.get("id") == operation.id
        assert put_response_dict.get("status") == "Rejected"
        assert put_response_dict.get("verified_by") == str(self.user.user_guid)
        assert put_response_dict.get("bc_obps_regulated_operation") is None

        get_response = TestUtils.mock_get_with_auth_role(self, "cas_admin", self.endpoint + "/" + str(operation.id))
        assert get_response.status_code == 200
        get_response_dict = get_response.json()
        assert get_response_dict.get("status") == "Rejected"
        now_as_string = now.strftime("%Y-%m-%d")
        assert get_response_dict.get("verified_at") == now_as_string

    def test_put_operation_not_verified_when_not_registered(self):
        operation = baker.make(Operation)
        assert operation.status == Operation.Statuses.NOT_REGISTERED

        url = self.build_update_status_url(operation_id=operation.id)

        put_response = TestUtils.mock_put_with_auth_role(
            self, "cas_admin", content_type_json, {"status": "Not Registered"}, url
        )
        assert put_response.status_code == 200
        put_response_dict = put_response.json()
        assert put_response_dict.get("id") == operation.id
        assert put_response_dict.get("status") == "Not Registered"
        assert put_response_dict.get("verified_by") is None
        assert put_response_dict.get("bc_obps_regulated_operation") is None

        get_response = TestUtils.mock_get_with_auth_role(self, "cas_admin", self.endpoint + "/" + str(operation.id))
        assert get_response.status_code == 200
        get_response_dict = get_response.json()
        assert get_response_dict.get("status") == "Not Registered"
        assert get_response_dict.get("verified_at") is None

    def test_put_operation_update_status_invalid_data(self):
        operation = baker.make(Operation)
        assert operation.status == Operation.Statuses.NOT_REGISTERED

        url = self.build_update_status_url(operation_id=operation.id)

        with pytest.raises(ValueError):
            TestUtils.mock_put_with_auth_role(self, "cas_admin", content_type_json, {"status": "nonsense"}, url)

    def test_put_operation_without_submit(self):
        operator = baker.make(Operator)
        operation = baker.make(Operation)
        mock_operation = TestUtils.mock_OperationUpdateIn()
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

    def test_put_operation_with_submit(self):
        operator = baker.make(Operator)
        operation = baker.make(Operation, id=5)

        mock_operation = TestUtils.mock_OperationUpdateIn()
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

    def test_put_malformed_operation(self):
        operation = baker.make(Operation)
        response = TestUtils.mock_put_with_auth_role(
            self,
            'industry_user',
            content_type_json,
            {"garbage": "i am bad data"},
            self.endpoint + "/" + str(operation.id) + "?submit=false",
        )

        assert response.status_code == 422

    def test_put_operation_with_application_lead(self):
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
        assert Contact.objects.count() == 2
