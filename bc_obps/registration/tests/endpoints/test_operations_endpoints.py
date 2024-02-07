import pytest, pytz
from datetime import datetime, timedelta, timezone
from model_bakery import baker
from django.test import Client
from localflavor.ca.models import CAPostalCodeField
from registration.models import (
    NaicsCode,
    Contact,
    Operation,
    User,
    UserOperator,
    Operator,
    RegulatedProduct,
)
from registration.schema import OperationCreateIn, OperationUpdateIn
from registration.tests.utils.helpers import CommonTestSetup, TestUtils

pytestmark = pytest.mark.django_db
from registration.tests.utils.bakers import document_baker, operation_baker, operator_baker, user_operator_baker

# initialize the APIClient app
client = Client()

base_endpoint = "/api/registration/"

content_type_json = "application/json"

baker.generators.add(CAPostalCodeField, TestUtils.mock_postal_code)

fake_timestamp_from_past = '2024-01-09 14:13:08.888903-0800'
fake_timestamp_from_past_str_format = '%Y-%m-%d %H:%M:%S.%f%z'


class TestOperationsEndpoint(CommonTestSetup):
    endpoint = base_endpoint + "operations"

    def build_update_status_url(self, operation_id: int) -> str:
        return self.endpoint + "/" + str(operation_id) + "/update-status"

    # AUTHORIZATION
    def test_operations_endpoint_unauthorized_users_cannot_get(self):
        operation_instance_1 = operation_baker()
        # /operations
        # unauthorized roles can't get
        response = TestUtils.mock_get_with_auth_role(self, "cas_pending")
        assert response.status_code == 401
        # /operations/{operation_id}
        response = TestUtils.mock_get_with_auth_role(
            self, "cas_pending", self.endpoint + "/" + str(operation_instance_1.id)
        )
        assert response.status_code == 401

        # unapproved industry users can't get
        # operations
        user_operator_instance = user_operator_baker()
        user_operator_instance.status = UserOperator.Statuses.PENDING
        user_operator_instance.user_id = self.user.user_guid
        user_operator_instance.save(update_fields=['user', 'status'])

        response = TestUtils.mock_get_with_auth_role(self, "industry_user")
        assert response.status_code == 401
        # /operations/{operation_id}
        response = TestUtils.mock_get_with_auth_role(
            self, "industry_user", self.endpoint + "/" + str(operation_instance_1.id)
        )
        assert response.status_code == 401

    def industry_users_can_only_get_their_own_operations(self):
        random_operator = operator_baker()
        the_users_operator = operator_baker()
        user_operator = baker.make(
            UserOperator,
            user_id=self.user.user_guid,
            status=UserOperator.Statuses.APPROVED,
            operator=the_users_operator,
        )

        random_operation = operation_baker(random_operator.id)
        operation_baker(user_operator.operator.id)  # operation that belongs to the user's operator

        # operations
        response = TestUtils.mock_get_with_auth_role(self, "industry_user")
        assert response.json().length() == 1

        # /operations/{operation_id}
        response = TestUtils.mock_get_with_auth_role(
            self, "industry_user", self.endpoint + "/" + str(random_operation.id)
        )
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
        operation = operation_baker()
        mock_operation = TestUtils.mock_OperationUpdateIn()
        # IRC users can't put
        roles = ['cas_pending', 'cas_admin', 'cas_analyst', 'industry_user']
        # unapproved industry users cannot put
        for role in roles:
            response = TestUtils.mock_put_with_auth_role(
                self,
                role,
                content_type_json,
                mock_operation.json(),
                self.endpoint + "/" + str(operation.id) + "?submit=false&form_section=1",
            )
            assert response.status_code == 401

    def industry_users_can_only_put_their_own_operations(self):
        mock_payload = TestUtils.mock_OperationUpdateIn()

        random_operator = baker.make(Operator)
        the_users_operator = baker.make(Operator)
        user_operator = baker.make(
            UserOperator,
            user_id=self.user.user_guid,
            status=UserOperator.Statuses.APPROVED,
            operator=the_users_operator,
        )

        random_operation = baker.make(Operation, operator=random_operator)
        baker.make(Operation, operator=user_operator.operator)  # operation that belongs to the user's operator

        response = TestUtils.mock_put_with_auth_role(
            self,
            "industry_user",
            content_type_json,
            mock_payload.json(),
            self.endpoint + "/" + str(random_operation.id) + "?submit=false",
        )
        assert response.status_code == 401

    def test_unauthorized_users_cannot_update_status(self):
        operation = operation_baker()

        url = self.build_update_status_url(operation_id=operation.id)

        response = TestUtils.mock_put_with_auth_role(
            self, "industry_user", content_type_json, {"status": "approved"}, url
        )
        assert response.status_code == 401

    # GET
    def test_operations_endpoint_get_method_for_200_status(self):
        # IRC users can get all operations
        response = TestUtils.mock_get_with_auth_role(self, "cas_admin")
        assert response.status_code == 200
        response = TestUtils.mock_get_with_auth_role(self, "cas_analyst")
        assert response.status_code == 200
        # industry users can only get their own company's operations, and only if they're approved
        user_operator_instance = user_operator_baker()
        user_operator_instance.status = UserOperator.Statuses.APPROVED
        user_operator_instance.user_id = self.user.user_guid
        user_operator_instance.save(update_fields=['user', 'status'])
        response = TestUtils.mock_get_with_auth_role(self, "industry_user")
        assert response.status_code == 200
        response = TestUtils.mock_get_with_auth_role(self, "industry_user")
        assert response.status_code == 200

    def test_get_method_for_invalid_operation_id(self):
        response = TestUtils.mock_get_with_auth_role(self, endpoint=self.endpoint + "/99999", role_name="cas_admin")
        assert response.status_code == 404
        assert response.json().get('detail') == "Not Found"

    def test_operations_endpoint_get_method_with_mock_data(self):
        # IRC users can get all operations except ones with a not Started status
        operator1 = operator_baker()
        operator2 = operator_baker()
        baker.make(
            Operation,
            operator_id=operator1.id,
            status=Operation.Statuses.PENDING,
            naics_code=baker.make(NaicsCode, naics_code=123456, naics_description='desc'),
            _quantity=30,
        )
        baker.make(
            Operation,
            operator_id=operator2.id,
            status=Operation.Statuses.APPROVED,
            naics_code=baker.make(NaicsCode, naics_code=123456, naics_description='desc'),
            _quantity=30,
        )
        baker.make(
            Operation,
            operator_id=operator2.id,
            status=Operation.Statuses.NOT_STARTED,
            naics_code=baker.make(NaicsCode, naics_code=123456, naics_description='desc'),
        )
        response = TestUtils.mock_get_with_auth_role(self, "cas_admin")
        assert response.status_code == 200
        response_data = response.json().get('data')
        assert len(response_data) == 20
        response = TestUtils.mock_get_with_auth_role(self, "cas_analyst")
        assert response.status_code == 200
        response_data = response.json().get('data')
        assert len(response_data) == 20
        # industry users can only see their own company's operations, and only if they're approved
        baker.make(
            UserOperator, user_id=self.user.user_guid, status=UserOperator.Statuses.APPROVED, operator_id=operator1.id
        )
        response = TestUtils.mock_get_with_auth_role(self, "industry_user")
        assert response.status_code == 200
        response_data = response.json().get('data')
        assert len(response_data) == 20

    def test_operations_endpoint_get_method_paginated(self):
        operator1 = operator_baker()
        baker.make(
            Operation,
            operator_id=operator1.id,
            status=Operation.Statuses.PENDING,
            naics_code=baker.make(NaicsCode, naics_code=123456, naics_description='desc'),
            _quantity=60,
        )
        # Get the default page 1 response
        response = TestUtils.mock_get_with_auth_role(self, "cas_admin")
        assert response.status_code == 200
        response_data = response.json().get('data')
        # save the id of the first paginated response item
        page_1_response_id = response_data[0].get('id')
        assert len(response_data) == 20
        # Get the page 2 response
        response = TestUtils.mock_get_with_auth_role(
            self, "cas_admin", self.endpoint + "?page=2&sort_field=created_at&sort_order=desc"
        )
        assert response.status_code == 200
        response_data = response.json().get('data')
        # save the id of the first paginated response item
        page_2_response_id = response_data[0].get('id')
        assert len(response_data) == 20
        # assert that the first item in the page 1 response is not the same as the first item in the page 2 response
        assert page_1_response_id != page_2_response_id

    # POST
    def test_authorized_roles_can_post_new_operation(self):
        operator = operator_baker()
        TestUtils.authorize_current_user_as_operator_user(self, operator)
        mock_operation = TestUtils.mock_OperationCreateIn()
        post_response = TestUtils.mock_post_with_auth_role(
            self, "industry_user", content_type_json, mock_operation.json()
        )
        assert post_response.status_code == 201
        assert post_response.json().get('name') == "Springfield Nuclear Power Plant"
        assert post_response.json().get('id') is not None
        # check that the default status of pending was applied
        get_response = TestUtils.mock_get_with_auth_role(self, "industry_user").json()
        get_response_data = get_response.get('data')[0]
        assert 'status' in get_response_data and get_response_data['status'] == 'Not Started'
        post_response = TestUtils.mock_post_with_auth_role(
            self, "industry_user", content_type_json, mock_operation.json(), endpoint=None
        )
        assert post_response.status_code == 201

    # commenting out this unit test for now because multiple_operators are not included in MVP
    # def test_post_new_operation_with_multiple_operators(self):
    #     naics_code = baker.make(NaicsCode)
    #     contact = baker.make(Contact)
    #     regulated_products = baker.make(RegulatedProduct, _quantity=2)
    #     # reporting_activities = baker.make(ReportingActivity, _quantity=2)
    #     operator = operator_baker()
    #     mock_operation = OperationCreateIn(
    #         name='Springfield Nuclear Power Plant',
    #         type='Single Facility Operation',
    #         naics_code_id=naics_code.id,
    #         # operation_has_multiple_operators=True,
    #         # multiple_operators_array=[
    #         #     {
    #         #         "mo_legal_name": "test",
    #         #         "mo_trade_name": "test",
    #         #         "mo_cra_business_number": 123,
    #         #         "mo_bc_corporate_registry_number": 'abc1234567',
    #         #         "mo_business_structure": "BC Corporation",
    #         #         "mo_website": "https://www.test-mo.com",
    #         #         "mo_physical_street_address": "test",
    #         #         "mo_physical_municipality": "test",
    #         #         "mo_physical_province": "BC",
    #         #         "mo_physical_postal_code": "V1V 1V1",
    #         #         "mo_mailing_address_same_as_physical": True,
    #         #         "mo_mailing_street_address": "test",
    #         #         "mo_mailing_municipality": "test",
    #         #         "mo_mailing_province": "BC",
    #         #         "mo_mailing_postal_code": "V1V 1V1",
    #         #     },
    #         #     {
    #         #         "mo_legal_name": "test2",
    #         #         "mo_trade_name": "test2",
    #         #         "mo_cra_business_number": 123,
    #         #         "mo_bc_corporate_registry_number": 'wer1234567',
    #         #         "mo_business_structure": "BC Corporation",
    #         #         "mo_physical_street_address": "test",
    #         #         "mo_physical_municipality": "test",
    #         #         "mo_physical_province": "BC",
    #         #         "mo_physical_postal_code": "V1V 1V1",
    #         #         "mo_mailing_address_same_as_physical": True,
    #         #         "mo_mailing_street_address": "test",
    #         #         "mo_mailing_municipality": "test",
    #         #         "mo_mailing_province": "BC",
    #         #         "mo_mailing_postal_code": "V1V 1V1",
    #         #     },
    #         # ],
    #         # reporting_activities=reporting_activities,
    #         regulated_products=regulated_products,
    #         contacts=[contact.id],
    #         operator_id=operator.id,
    #     )
    #     post_response = TestUtils.mock_post_with_auth_role(
    #         self, 'industry_user', content_type_json, mock_operation.json()
    #     )
    #     assert post_response.status_code == 201
    #     assert post_response.json().get('id') is not None
    #     baker.make(
    #         UserOperator, user_id=self.user.user_guid, status=UserOperator.Statuses.APPROVED, operator_id=operator.id
    #     )
    #     get_response = TestUtils.mock_get_with_auth_role(self, 'industry_user').json()[0]
    #     assert (
    #         'operation_has_multiple_operators' in get_response
    #         and get_response['operation_has_multiple_operators'] == True
    #     )
    #     assert 'multiple_operators_array' in get_response and len(get_response['multiple_operators_array']) == 2

    def test_post_new_malformed_operation(self):
        response = TestUtils.mock_post_with_auth_role(
            self, "industry_user", content_type_json, {"garbage": "i am bad data"}
        )
        assert response.status_code == 422

    def test_post_existing_operation(self):
        operation_instance = operation_baker()
        operation_instance.bcghg_id = 123
        operation_instance.save(update_fields=['bcghg_id'])
        mock_operation2 = TestUtils.mock_OperationCreateIn()
        mock_operation2.bcghg_id = 123
        operator = operator_baker()
        TestUtils.authorize_current_user_as_operator_user(self, operator)
        post_response = TestUtils.mock_post_with_auth_role(
            self, "industry_user", content_type_json, data=mock_operation2.json()
        )
        assert post_response.status_code == 400
        assert post_response.json().get('message') == "Operation with this BCGHG ID already exists."

    def test_post_new_operation_without_point_of_contact(self):
        new_operation = OperationCreateIn(
            documents=[],
            point_of_contact=None,
            status=Operation.Statuses.NOT_STARTED,
            naics_code_id=NaicsCode.objects.first().id,
            name='My New Operation',
            type='Type 1',
            regulated_products=[],
            # reporting_activities=[],
        )
        operator = operator_baker()
        TestUtils.authorize_current_user_as_operator_user(self, operator)
        post_response = TestUtils.mock_post_with_auth_role(
            self, "industry_user", content_type_json, data=new_operation.json()
        )
        assert post_response.status_code == 201
        assert Operation.objects.count() == 1
        operation = Operation.objects.first()
        assert operation.name == 'My New Operation'
        assert operation.point_of_contact is None
        assert operation.point_of_contact_id is None

    # PUT
    def test_put_operation_update_invalid_operation_id(self):
        url = self.build_update_status_url(operation_id=99999999999)
        put_response = TestUtils.mock_put_with_auth_role(
            self, "cas_admin", content_type_json, {"status": "approved"}, url
        )
        assert put_response.status_code == 404
        assert put_response.json().get('detail') == "Not Found"

    def test_put_operation_update_status_approved(self):
        operation = operation_baker()
        assert operation.status == Operation.Statuses.NOT_STARTED

        url = self.build_update_status_url(operation_id=operation.id)

        now = datetime.now(pytz.utc)
        put_response_1 = TestUtils.mock_put_with_auth_role(
            self, "cas_admin", content_type_json, {"status": "Approved"}, url
        )
        assert put_response_1.status_code == 200
        put_response_1_dict = put_response_1.json()
        assert put_response_1_dict.get("id") == operation.id
        operation_after_put = Operation.objects.get(id=operation.id)
        assert operation_after_put.status == Operation.Statuses.APPROVED
        assert operation_after_put.verified_by == self.user
        assert operation_after_put.bc_obps_regulated_operation is not None
        operator = Operator.objects.get(id=operation.operator_id)
        assert operator.status == Operator.Statuses.APPROVED
        assert operator.is_new is False
        assert operator.verified_by == self.user
        assert operator.verified_at.strftime("%Y-%m-%d") == now.strftime("%Y-%m-%d")

        get_response = TestUtils.mock_get_with_auth_role(self, "cas_admin", self.endpoint + "/" + str(operation.id))
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
            self, "cas_admin", content_type_json, {"status": "Approved"}, url
        )
        assert put_response_2.status_code == 200
        assert new_operator.status == Operator.Statuses.APPROVED
        assert new_operator.verified_at == random_time
        assert new_operator.verified_by == random_user
        assert new_operator.verified_by != self.user

    def test_put_operation_update_status_declined(self):
        operation = operation = operation_baker()
        assert operation.status == Operation.Statuses.NOT_STARTED

        url = self.build_update_status_url(operation_id=operation.id)

        put_response = TestUtils.mock_put_with_auth_role(
            self, "cas_admin", content_type_json, {"status": "Declined"}, url
        )
        assert put_response.status_code == 200
        put_response_dict = put_response.json()
        assert put_response_dict.get("id") == operation.id
        operation_after_put = Operation.objects.get(id=operation.id)
        assert operation_after_put.status == Operation.Statuses.DECLINED
        assert operation_after_put.verified_by == self.user
        assert operation_after_put.bc_obps_regulated_operation is None

        get_response = TestUtils.mock_get_with_auth_role(self, "cas_admin", self.endpoint + "/" + str(operation.id))
        assert get_response.status_code == 200
        get_response_dict = get_response.json()
        assert get_response_dict.get("status") == "Declined"

    def test_put_operation_not_verified_when_not_registered(self):
        operation = operation_baker()
        assert operation.status == Operation.Statuses.NOT_STARTED

        url = self.build_update_status_url(operation_id=operation.id)

        put_response = TestUtils.mock_put_with_auth_role(
            self, "cas_admin", content_type_json, {"status": "Not Started"}, url
        )
        assert put_response.status_code == 200
        put_response_dict = put_response.json()
        assert put_response_dict.get("id") == operation.id
        operation_after_put = Operation.objects.get(id=operation.id)
        assert operation_after_put.status == Operation.Statuses.NOT_STARTED
        assert operation_after_put.verified_by is None
        assert operation_after_put.bc_obps_regulated_operation is None

        get_response = TestUtils.mock_get_with_auth_role(self, "cas_admin", self.endpoint + "/" + str(operation.id))
        assert get_response.status_code == 200
        get_response_dict = get_response.json()
        assert get_response_dict.get("status") == "Not Started"
        assert get_response_dict.get("verified_at") is None

    def test_put_operation_update_status_invalid_data(self):
        operation = operation_baker()
        assert operation.status == Operation.Statuses.NOT_STARTED

        url = self.build_update_status_url(operation_id=operation.id)

        response = TestUtils.mock_put_with_auth_role(self, "cas_admin", content_type_json, {"status": "nonsense"}, url)
        assert response.status_code == 400
        assert response.json().get('message') == "'nonsense' is not a valid Operation.Statuses"

    def test_put_operation_without_submit(self):
        payload = TestUtils.mock_OperationUpdateIn()
        operator = operator_baker()
        operation = operation_baker(operator.pk)

        # approve the user
        baker.make(
            UserOperator,
            user_id=self.user.user_guid,
            status=UserOperator.Statuses.APPROVED,
            operator_id=operator.pk,
        )
        response = TestUtils.mock_put_with_auth_role(
            self,
            'industry_user',
            content_type_json,
            payload.json(),
            self.endpoint + "/" + str(operation.id) + "?submit=false&form_section=1",
        )
        assert response.status_code == 200
        assert response.json() == {"name": "New name"}

        get_response = TestUtils.mock_get_with_auth_role(
            self, "industry_user", self.endpoint + "/" + str(operation.id)
        ).json()
        assert get_response["status"] == Operation.Statuses.NOT_STARTED

    def test_put_operation_with_submit(self):
        payload = TestUtils.mock_OperationUpdateIn()
        operator = operator_baker()
        operation = operation_baker(operator.pk)

        # Upload testing requires Google cloud credentials to be set up in CI. Will be addressed in #718
        # setattr(payload, 'statutory_declaration', MOCK_DATA_URL)

        baker.make(
            UserOperator,
            user_id=self.user.user_guid,
            status=UserOperator.Statuses.APPROVED,
            operator_id=operator.pk,
        )

        response = TestUtils.mock_put_with_auth_role(
            self,
            'industry_user',
            content_type_json,
            payload.json(),
            self.endpoint + "/" + str(operation.id) + "?submit=true&form_section=1",
        )

        assert response.status_code == 200
        assert response.json() == {"name": "New name"}

        get_response = TestUtils.mock_get_with_auth_role(
            self, "industry_user", self.endpoint + "/" + str(operation.id)
        ).json()
        assert get_response["status"] == Operation.Statuses.PENDING
        assert get_response["name"] == payload.name
        operation_after_put = Operation.objects.get(id=get_response["id"])
        assert operation_after_put.submission_date is not None

    def test_put_malformed_operation(self):
        operation = operation_baker()
        response = TestUtils.mock_put_with_auth_role(
            self,
            'industry_user',
            content_type_json,
            {"garbage": "i am bad data"},
            self.endpoint + "/" + str(operation.id) + "?submit=false&form_section=1",
        )

        assert response.status_code == 422

    def test_put_operation_with_updated_point_of_contact(self):
        contact1 = baker.make(Contact)
        # contact2 is a new contact, even though they have the same email as contact1
        contact2 = baker.make(Contact, email=contact1.email)
        operator = operator_baker()
        operation = operation_baker(operator.id)
        operation.point_of_contact = contact2
        operation.save(update_fields=['point_of_contact'])

        update = OperationUpdateIn(
            name='Springfield Nuclear Power Plant',
            # this updates the existing contact (contact2)
            type='Single Facility Operation',
            naics_code_id=operation.naics_code_id,
            # reporting_activities=[],
            regulated_products=[],
            # operation_has_multiple_operators=False,
            operator_id=operator.id,
            is_external_point_of_contact=False,
            street_address='19 Evergreen Terrace',
            municipality='Springfield',
            province='BC',
            postal_code='V1V 1V1',
            first_name='Homer',
            last_name='Simpson',
            email="homer@email.com",
            position_title='Nuclear Safety Inspector',
            phone_number='+17787777777',
        )
        TestUtils.authorize_current_user_as_operator_user(self, operator)
        put_response = TestUtils.mock_put_with_auth_role(
            self,
            'industry_user',
            content_type_json,
            update.json(),
            self.endpoint + '/' + str(operation.id) + "?submit=true&form_section=2",
        )
        assert put_response.status_code == 200

        # we should have 2 contacts in the db (contact1 and contact2), where contact2's info has been updated
        # based on the data provided in update
        assert Contact.objects.count() == 3  # 2 from baker.make, 1 from the update
        # this checks that we added a new contact instead of updating the existing one even though they have the same email
        updated_contact2 = Contact.objects.get(id=contact2.id)
        assert updated_contact2.first_name == 'Homer'
        assert updated_contact2.email == 'homer@email.com'

    def test_put_operation_with_new_point_of_contact(self):
        operator = operator_baker()
        operation = operation_baker(operator.id)
        first_contact = operation.point_of_contact
        update = OperationUpdateIn(
            name='Springfield Nuclear Power Plant',
            type='Single Facility Operation',
            naics_code_id=operation.naics_code_id,
            # reporting_activities=[],
            regulated_products=[],
            # operation_has_multiple_operators=False,
            documents=[],
            operator_id=operator.id,
            is_external_point_of_contact=True,
            external_point_of_contact_first_name='Bart',
            external_point_of_contact_last_name='Simpson',
            external_point_of_contact_position_title='Scoundrel',
            external_point_of_contact_email='bart@email.com',
            external_point_of_contact_phone_number='+17787777777',
            street_address='19 Evergreen Terrace',
            municipality='Springfield',
            province='BC',
            postal_code='V1V 1V1',
            first_name='Homer',
            last_name='Simpson',
            email="homer@email.com",
            position_title='Nuclear Safety Inspector',
            phone_number='+17787777777',
        )
        TestUtils.authorize_current_user_as_operator_user(self, operator)
        put_response = TestUtils.mock_put_with_auth_role(
            self,
            'industry_user',
            content_type_json,
            update.json(),
            self.endpoint + '/' + str(operation.id) + "?submit=true&form_section=2",
        )
        assert put_response.status_code == 200

        # expect 1 Contact in the database -- we are updating the existing point_of_contact
        contacts = Contact.objects.all()
        assert contacts.count() == 1
        assert first_contact in contacts
        # assert that external_point_of_contact is one of the Contacts in the database
        bart_contact = None
        for c in contacts:
            if hasattr(c, 'first_name') and getattr(c, 'first_name') == 'Bart':
                bart_contact = c
                break
        assert bart_contact is not None
        # 'Homer' was the user that registered the Operation, but shouldn't be created as a Contact. Assert that he isn't
        homer_contact = None
        for c in contacts:
            if hasattr(c, 'first_name') and getattr(c, 'first_name') == 'Homer':
                homer_contact = c
                break
        assert homer_contact is None

    def test_put_operation_with_no_point_of_contact(self):
        operator = operator_baker()
        operation = operation_baker()
        operation.point_of_contact = None
        operation.operator_id = operator.id
        operation.save(update_fields=['point_of_contact', 'operator_id'])

        update = OperationUpdateIn(
            name='Updated Name',
            type='Type',
            naics_code_id=operation.naics_code_id,
            operator_id=operator.id,
            documents=[],
            regulated_products=[],
            # reporting_activities=[],
        )

        TestUtils.authorize_current_user_as_operator_user(self, operator)
        put_response = TestUtils.mock_put_with_auth_role(
            self,
            'industry_user',
            content_type_json,
            update.json(),
            self.endpoint + '/' + str(operation.id) + "?submit=true&form_section=1",
        )
        assert put_response.status_code == 200
        assert Operation.objects.count() == 1
        assert Contact.objects.count() == 1  # 1 from operation baker
        retrieved_operation = Operation.objects.first()
        assert retrieved_operation.name == 'Updated Name'
        assert retrieved_operation.point_of_contact_id is None
        assert retrieved_operation.point_of_contact is None

    def test_put_operation_that_is_already_approved(self):
        operator = operator_baker()
        operation = operation_baker()
        operation.operator_id = operator.id
        operation.status = Operation.Statuses.APPROVED
        operation.submission_date = fake_timestamp_from_past
        operation.save(update_fields=['status', 'operator_id', 'submission_date'])

        update = OperationUpdateIn(
            name='Shorter legal Name',
            type='Type',
            operator_id=operator.id,
            naics_code_id=operation.naics_code_id,
            documents=[],
            regulated_products=[],
            # reporting_activities=[],
        )

        TestUtils.authorize_current_user_as_operator_user(self, operator)
        put_response = TestUtils.mock_put_with_auth_role(
            self,
            'industry_user',
            content_type_json,
            update.json(),
            self.endpoint + '/' + str(operation.id) + "?submit=true&form_section=1",
        )
        assert put_response.status_code == 200
        assert Operation.objects.count() == 1
        retrieved_operation = Operation.objects.first()
        assert retrieved_operation.name == 'Shorter legal Name'
        assert retrieved_operation.submission_date == datetime.strptime(
            fake_timestamp_from_past, fake_timestamp_from_past_str_format
        )
        assert retrieved_operation.status == Operation.Statuses.APPROVED

    def test_put_operation_with_changes_requested(self):
        operator = operator_baker()
        operation = operation_baker()
        operation.operator_id = operator.id
        operation.status = Operation.Statuses.CHANGES_REQUESTED
        operation.submission_date = fake_timestamp_from_past
        operation.save(update_fields=['status', 'operator_id', 'submission_date'])

        update = OperationUpdateIn(
            name='Updated Name',
            type='Type',
            operator_id=operator.id,
            naics_code_id=operation.naics_code_id,
            documents=[],
            regulated_products=[],
            # reporting_activities=[],
        )
        TestUtils.authorize_current_user_as_operator_user(self, operator)
        put_response = TestUtils.mock_put_with_auth_role(
            self,
            'industry_user',
            content_type_json,
            update.json(),
            self.endpoint + '/' + str(operation.id) + "?submit=true&form_section=1",
        )

        assert put_response.status_code == 200
        assert Operation.objects.count() == 1
        retrieved_operation = Operation.objects.first()
        assert retrieved_operation.name == 'Updated Name'
        assert retrieved_operation.submission_date > datetime.strptime(
            fake_timestamp_from_past, fake_timestamp_from_past_str_format
        )
        # assert that operation's submission_date has been updated to the current time (approximately)
        assert retrieved_operation.submission_date - datetime.now(timezone.utc) < timedelta(seconds=10)
        assert retrieved_operation.status == Operation.Statuses.PENDING

    def test_put_operation_with_pending_status(self):
        operator = operator_baker()
        operation = operation_baker()
        operation.operator_id = operator.id
        operation.status = Operation.Statuses.PENDING
        operation.submission_date = fake_timestamp_from_past
        operation.save(update_fields=['status', 'operator_id', 'submission_date'])

        update = OperationUpdateIn(
            name='Pending Legal Name',
            type='Type',
            operator_id=operator.id,
            naics_code_id=operation.naics_code_id,
            documents=[],
            regulated_products=[],
            # reporting_activities=[],
        )
        TestUtils.authorize_current_user_as_operator_user(self, operator)
        put_response = TestUtils.mock_put_with_auth_role(
            self,
            'industry_user',
            content_type_json,
            update.json(),
            self.endpoint + '/' + str(operation.id) + "?submit=true&form_section=1",
        )

        assert put_response.status_code == 200
        assert Operation.objects.count() == 1
        retrieved_operation = Operation.objects.first()
        assert retrieved_operation.name == 'Pending Legal Name'
        assert retrieved_operation.submission_date > datetime.strptime(
            fake_timestamp_from_past, fake_timestamp_from_past_str_format
        )
        # assert that operation's submission_date has been updated to the current time (approximately)
        assert retrieved_operation.submission_date - datetime.now(timezone.utc) < timedelta(seconds=10)
        assert retrieved_operation.status == Operation.Statuses.PENDING

    def test_put_operation_with_declined_status(self):
        operator = operator_baker()
        operation = operation_baker()
        operation.operator_id = operator.id
        operation.status = Operation.Statuses.DECLINED
        operation.submission_date = fake_timestamp_from_past
        operation.save(update_fields=['status', 'operator_id', 'submission_date'])

        regulated_product = baker.make(RegulatedProduct)
        update = OperationUpdateIn(
            name='Declined Operation Name',
            type='Type',
            operator_id=operator.id,
            naics_code_id=operation.naics_code_id,
            documents=[],
            regulated_products=[regulated_product.id],
            # reporting_activities=[],
        )
        TestUtils.authorize_current_user_as_operator_user(self, operator)
        put_response = TestUtils.mock_put_with_auth_role(
            self,
            'industry_user',
            content_type_json,
            update.json(),
            self.endpoint + '/' + str(operation.id) + "?submit=true&form_section=1",
        )

        assert put_response.status_code == 200
        assert Operation.objects.count() == 1
        retrieved_operation = Operation.objects.first()
        assert retrieved_operation.name == 'Declined Operation Name'
        assert retrieved_operation.submission_date > datetime.strptime(
            fake_timestamp_from_past, fake_timestamp_from_past_str_format
        )
        # assert that operation's submission_date has been updated to the current time (approximately)
        assert retrieved_operation.submission_date - datetime.now(timezone.utc) < timedelta(seconds=10)
        assert retrieved_operation.status == Operation.Statuses.PENDING

    def test_put_operation_one_form_section_at_a_time(self):
        # test setup
        operator = operator_baker()
        operation = operation_baker()
        operation.operator_id = operator.id
        operation.save(update_fields=['operator_id'])
        TestUtils.authorize_current_user_as_operator_user(self, operator)
        original_contact_id = operation.point_of_contact.id

        # update fields visible in section 1 of form (on frontend)
        update_from_form_section_1 = OperationUpdateIn(
            name='New and Improved Legal Name',
            type='Type A',
            operator_id=operator.id,
            documents=[],
            regulated_products=[],
            naics_code_id=operation.naics_code_id
            # reporting_activities=[1],
        )
        put_response_1 = TestUtils.mock_put_with_auth_role(
            self,
            'industry_user',
            content_type_json,
            update_from_form_section_1.json(),
            self.endpoint + '/' + str(operation.id) + "?submit=false&form_section=1",
        )
        assert put_response_1.status_code == 200
        assert Operation.objects.count() == 1
        retrieved_op = Operation.objects.first()
        assert retrieved_op.name == 'New and Improved Legal Name'
        assert retrieved_op.type == 'Type A'

        # update fields visible in section 2 of form
        update_from_form_section_2 = OperationUpdateIn(
            name='This name should not be changed',
            type='bad type',
            operator_id=operator.id,
            naics_code_id=operation.naics_code_id,
            regulated_products=[],
            # reporting_activities=[],
            is_external_point_of_contact=True,
            external_point_of_contact_first_name='Bart',
            external_point_of_contact_last_name='Simpson',
            external_point_of_contact_position_title='Scoundrel',
            external_point_of_contact_email='bart@email.com',
            external_point_of_contact_phone_number='+17787777777',
        )
        put_response_2 = TestUtils.mock_put_with_auth_role(
            self,
            'industry_user',
            content_type_json,
            update_from_form_section_2.json(),
            self.endpoint + '/' + str(operation.id) + "?submit=false&form_section=2",
        )
        assert put_response_2.status_code == 200
        assert Operation.objects.count() == 1
        retrieved_op = Operation.objects.first()
        # should be 1 contacts - we updated the existing point_of_contact
        assert Contact.objects.count() == 1
        assert retrieved_op.point_of_contact.first_name == 'Bart'
        assert retrieved_op.point_of_contact_id == original_contact_id
        assert retrieved_op.name == 'New and Improved Legal Name'
