from datetime import datetime, timedelta, timezone
from model_bakery import baker
from localflavor.ca.models import CAPostalCodeField
import pytest
from registration.enums.enums import BoroIdApplicationStates
from registration.models import (
    Contact,
    Operation,
    UserOperator,
    RegulatedProduct,
)
from registration.schema.v1 import OperationUpdateIn
from registration.tests.utils.helpers import CommonTestSetup, TestUtils

from registration.tests.utils.bakers import operation_baker, operator_baker, user_operator_baker
from registration.utils import custom_reverse_lazy

baker.generators.add(CAPostalCodeField, TestUtils.mock_postal_code)

fake_timestamp_from_past = '2024-01-09 14:13:08.888903-0800'
fake_timestamp_from_past_str_format = '%Y-%m-%d %H:%M:%S.%f%z'


class TestOperationIdEndpoint(CommonTestSetup):
    endpoint = CommonTestSetup.base_endpoint + "v1/operations"

    @pytest.fixture(autouse=True)
    def setup_mocks(self, mocker):
        # Setup the mock here; it will be executed before each test method
        self.mock_send_boro_id_application_email = mocker.patch(
            "service.operation_service.send_boro_id_application_email"
        )

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
        users_operation = operation_baker(user_operator.operator.id)  # operation that belongs to the user's operator

        # operations
        response_1 = TestUtils.mock_get_with_auth_role(self, "industry_user")
        response_json = response_1.json()
        assert len(response_json.get('data')) == 1
        assert response_json.get('row_count') == 1
        response_data = response_json.get('data')
        assert response_data[0].get('id') == str(users_operation.id)  # string representation of UUID
        assert response_data[0].get('name') == users_operation.name
        # Make sure the response has the expected keys based on the schema
        assert response_data[0].keys() == {
            'id',
            'name',
            'bcghg_id',
            'status',
            'submission_date',
            'operator',
            'bc_obps_regulated_operation',
        }

        # /operations/{operation_id}
        response_2 = TestUtils.mock_get_with_auth_role(
            self, "industry_user", custom_reverse_lazy("get_operation", kwargs={"operation_id": random_operation.id})
        )
        assert response_2.status_code == 401

    def test_users_get_different_data_based_on_role(self):
        the_users_operator = operator_baker()
        user_operator = baker.make(
            UserOperator,
            user_id=self.user.user_guid,
            status=UserOperator.Statuses.APPROVED,
            operator=the_users_operator,
        )

        users_operation = operation_baker(user_operator.operator.id)
        response_1 = TestUtils.mock_get_with_auth_role(
            self, "industry_user", custom_reverse_lazy("v1_get_operation", kwargs={"operation_id": users_operation.id})
        )
        assert response_1.status_code == 200
        response_1_data = response_1.json()
        assert response_1_data.get('id') == str(users_operation.id)  # string representation of UUID
        assert response_1_data.get('name') == users_operation.name
        # Make sure the response has the expected keys based on the role
        response_keys = {
            'operator',
            'id',
            'name',
            'type',
            'bcghg_id',
            'opt_in',
            'regulated_products',
            'status',
            'naics_code_id',
            'first_name',
            'last_name',
            'email',
            'phone_number',
            'position_title',
            'street_address',
            'municipality',
            'province',
            'postal_code',
            'statutory_declaration',
            'bc_obps_regulated_operation',
        }
        assert sorted(response_1_data.keys()) == sorted(response_keys)
        # Make sure the `operator` key has None value for industry users
        assert response_1_data.get('operator') is None

        response_2 = TestUtils.mock_get_with_auth_role(
            self, "cas_admin", custom_reverse_lazy("v1_get_operation", kwargs={"operation_id": users_operation.id})
        )
        assert response_2.status_code == 200
        response_2_data = response_2.json()
        assert response_2_data.get('id') == str(users_operation.id)  # string representation of UUID
        assert response_2_data.get('name') == users_operation.name
        assert sorted(response_2_data.keys()) == sorted(response_keys)
        # Make sure the `operator` key has a value for IRC users
        assert response_2_data.get('operator') is not None

    def test_industry_users_can_only_put_their_own_operations(self):
        mock_payload = TestUtils.mock_update_operation_payload()
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
        response = TestUtils.mock_put_with_auth_role(
            self,
            "industry_user",
            self.content_type,
            mock_payload,
            custom_reverse_lazy("v1_update_operation", kwargs={"operation_id": random_operation.id})
            + "?submit=false&form_section=1",
        )
        assert response.status_code == 401

    def test_get_operation_with_invalid_operation_id(self):
        response = TestUtils.mock_get_with_auth_role(
            self,
            endpoint=custom_reverse_lazy("v1_get_operation", kwargs={"operation_id": '99999'}),
            role_name="cas_admin",
        )
        assert response.status_code == 422
        assert (
            response.json().get('detail')[0].get('msg')
            == 'Input should be a valid UUID, invalid length: expected length 32 for simple format, found 5'
        )

    def test_put_operation_update_status_invalid_operation_id(self):
        put_response = TestUtils.mock_put_with_auth_role(
            self,
            "cas_admin",
            self.content_type,
            {"status": "approved"},
            custom_reverse_lazy("v1_update_operation_status", kwargs={"operation_id": 99999999999}),
        )
        assert put_response.status_code == 422
        assert (
            put_response.json().get('detail')[0].get('msg')
            == 'Input should be a valid UUID, invalid length: expected length 32 for simple format, found 11'
        )

    def test_industry_user_update_operation_without_submit(self):
        payload = TestUtils.mock_update_operation_payload()
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
            self.content_type,
            payload,
            custom_reverse_lazy("v1_update_operation", kwargs={"operation_id": operation.id})
            + "?submit=false&form_section=1",
        )
        assert response.status_code == 200
        assert response.json() == {"name": "New name"}

        self.mock_send_boro_id_application_email.assert_not_called()

        get_response = TestUtils.mock_get_with_auth_role(
            self, "industry_user", custom_reverse_lazy("v1_get_operation", kwargs={"operation_id": operation.id})
        ).json()
        assert get_response["status"] == Operation.Statuses.DRAFT

    def test_industry_user_update_operation_with_submit(self):
        payload = TestUtils.mock_update_operation_payload()
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
            self.content_type,
            payload,
            custom_reverse_lazy("v1_update_operation", kwargs={"operation_id": operation.id})
            + "?submit=true&form_section=1",
        )

        assert response.status_code == 200
        assert response.json() == {"name": "New name"}

        operation.refresh_from_db()
        self.mock_send_boro_id_application_email.assert_called_once_with(
            application_state=BoroIdApplicationStates.CONFIRMATION,
            operator_legal_name=operation.operator.legal_name,
            operation_name=payload['name'],
            opted_in=None,
            operation_creator=operation.created_by,
            point_of_contact=operation.point_of_contact,
        )

        get_response = TestUtils.mock_get_with_auth_role(
            self, "industry_user", custom_reverse_lazy("v1_get_operation", kwargs={"operation_id": operation.id})
        ).json()
        assert get_response["status"] == Operation.Statuses.PENDING
        assert get_response["name"] == payload['name']
        operation_after_put = Operation.objects.get(id=get_response["id"])
        assert operation_after_put.submission_date is not None

    def test_industry_user_update_operation_with_malformed_date(self):
        operation = operation_baker()
        TestUtils.authorize_current_user_as_operator_user(self, operation.operator)
        response = TestUtils.mock_put_with_auth_role(
            self,
            'industry_user',
            self.content_type,
            {"garbage": "i am bad data"},
            custom_reverse_lazy("v1_update_operation", kwargs={"operation_id": operation.id})
            + "?submit=false&form_section=1",
        )

        assert response.status_code == 422

    def test_industry_user_update_operation_with_updated_point_of_contact(self):
        contact1 = baker.make_recipe('utils.contact')
        # contact2 is a new contact, even though they have the same email as contact1
        contact2 = baker.make_recipe('utils.contact', email=contact1.email)
        operator = baker.make_recipe('utils.operator')
        operation = baker.make_recipe('utils.operation', operator=operator, point_of_contact=contact2)

        update = OperationUpdateIn(
            name='Springfield Nuclear Power Plant',
            # this updates the existing contact (contact2)
            type='Single Facility Operation',
            naics_code_id=operation.naics_code_id,
            # activity=[],
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
            self.content_type,
            update.model_dump_json(),
            custom_reverse_lazy("v1_update_operation", kwargs={"operation_id": operation.id})
            + "?submit=true&form_section=2",
        )
        assert put_response.status_code == 200

        # we should have 2 contacts in the db (contact1 and contact2), where contact2's info has been updated

        assert Contact.objects.count() == 2

        updated_contact2 = Contact.objects.get(id=contact2.id)
        assert updated_contact2.first_name == 'Homer'
        assert updated_contact2.email == 'homer@email.com'

        operation.refresh_from_db()
        self.mock_send_boro_id_application_email.assert_called_once_with(
            application_state=BoroIdApplicationStates.CONFIRMATION,
            operator_legal_name=operation.operator.legal_name,
            operation_name=operation.name,
            opted_in=operation.opt_in,
            operation_creator=operation.created_by,
            point_of_contact=updated_contact2,
        )

    def test_industry_user_update_operation_with_new_point_of_contact(self):
        operator = operator_baker()
        operation = operation_baker(operator.id)
        first_contact = operation.point_of_contact
        update = OperationUpdateIn(
            name='Springfield Nuclear Power Plant',
            type='Single Facility Operation',
            naics_code_id=operation.naics_code_id,
            # activity=[],
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
            self.content_type,
            update.model_dump_json(),
            custom_reverse_lazy("v1_update_operation", kwargs={"operation_id": operation.id})
            + "?submit=true&form_section=2",
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

    def test_industry_user_update_operation_with_no_point_of_contact(self):
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
            # activity=[],
        )

        TestUtils.authorize_current_user_as_operator_user(self, operator)
        put_response = TestUtils.mock_put_with_auth_role(
            self,
            'industry_user',
            self.content_type,
            update.model_dump_json(),
            custom_reverse_lazy("v1_update_operation", kwargs={"operation_id": operation.id})
            + "?submit=true&form_section=1",
        )
        assert put_response.status_code == 200
        assert Operation.objects.count() == 1
        assert Contact.objects.count() == 1  # 1 from operation baker
        retrieved_operation = Operation.objects.first()
        assert retrieved_operation.name == 'Updated Name'
        assert retrieved_operation.point_of_contact_id is None
        assert retrieved_operation.point_of_contact is None

    def test_industry_user_update_operation_that_is_already_approved(self):
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
            # activity=[],
        )

        TestUtils.authorize_current_user_as_operator_user(self, operator)
        put_response = TestUtils.mock_put_with_auth_role(
            self,
            'industry_user',
            self.content_type,
            update.model_dump_json(),
            custom_reverse_lazy("v1_update_operation", kwargs={"operation_id": operation.id})
            + "?submit=true&form_section=1",
        )
        assert put_response.status_code == 200
        assert Operation.objects.count() == 1
        retrieved_operation = Operation.objects.first()
        assert retrieved_operation.name == 'Shorter legal Name'
        assert retrieved_operation.submission_date == datetime.strptime(
            fake_timestamp_from_past, fake_timestamp_from_past_str_format
        )
        assert retrieved_operation.status == Operation.Statuses.APPROVED

        self.mock_send_boro_id_application_email.assert_not_called()

    def test_put_operation_ignores_declines_user_operator_records(self):
        operator = operator_baker()
        operator2 = operator_baker()
        baker.make(
            UserOperator, user_id=self.user.user_guid, status=UserOperator.Statuses.DECLINED, operator_id=operator2.id
        )
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
            # activity=[],
        )

        TestUtils.authorize_current_user_as_operator_user(self, operator)
        put_response = TestUtils.mock_put_with_auth_role(
            self,
            'industry_user',
            self.content_type,
            update.model_dump_json(),
            custom_reverse_lazy("v1_update_operation", kwargs={"operation_id": operation.id})
            + "?submit=true&form_section=1",
        )
        assert put_response.status_code == 200
        assert Operation.objects.count() == 1
        retrieved_operation = Operation.objects.first()
        assert retrieved_operation.name == 'Shorter legal Name'

    def test_industry_user_update_operation_with_changes_requested_status(self):
        operator = operator_baker()
        operation = operation_baker()
        operation.operator_id = operator.id
        operation.status = Operation.Statuses.CHANGES_REQUESTED
        operation.submission_date = fake_timestamp_from_past
        operation.created_by = self.user
        operation.save(update_fields=['status', 'operator_id', 'submission_date', 'created_by'])

        update = OperationUpdateIn(
            name='Updated Name',
            type='Type',
            operator_id=operator.id,
            naics_code_id=operation.naics_code_id,
            documents=[],
            regulated_products=[],
            # activity=[],
        )
        TestUtils.authorize_current_user_as_operator_user(self, operator)
        put_response = TestUtils.mock_put_with_auth_role(
            self,
            'industry_user',
            self.content_type,
            update.model_dump_json(),
            custom_reverse_lazy("v1_update_operation", kwargs={"operation_id": operation.id})
            + "?submit=true&form_section=1",
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

        operation.refresh_from_db()
        self.mock_send_boro_id_application_email.assert_called_once_with(
            application_state=BoroIdApplicationStates.CONFIRMATION,
            operator_legal_name=retrieved_operation.operator.legal_name,
            operation_name=retrieved_operation.name,
            opted_in=retrieved_operation.opt_in,
            operation_creator=retrieved_operation.created_by,
            point_of_contact=retrieved_operation.point_of_contact,
        )

    def test_industry_user_update_operation_with_pending_status(self):
        operator = operator_baker()
        operation = operation_baker()
        operation.operator_id = operator.id
        operation.status = Operation.Statuses.PENDING
        operation.submission_date = fake_timestamp_from_past
        operation.created_by = self.user
        operation.save(update_fields=['status', 'operator_id', 'submission_date', 'created_by'])

        update = OperationUpdateIn(
            name='Pending Legal Name',
            type='Type',
            operator_id=operator.id,
            naics_code_id=operation.naics_code_id,
            documents=[],
            regulated_products=[],
            # activity=[],
        )
        TestUtils.authorize_current_user_as_operator_user(self, operator)
        put_response = TestUtils.mock_put_with_auth_role(
            self,
            'industry_user',
            self.content_type,
            update.model_dump_json(),
            custom_reverse_lazy("v1_update_operation", kwargs={"operation_id": operation.id})
            + "?submit=true&form_section=1",
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

        operation.refresh_from_db()
        self.mock_send_boro_id_application_email.assert_called_once_with(
            application_state=BoroIdApplicationStates.CONFIRMATION,
            operator_legal_name=retrieved_operation.operator.legal_name,
            operation_name=retrieved_operation.name,
            opted_in=retrieved_operation.opt_in,
            operation_creator=retrieved_operation.created_by,
            point_of_contact=retrieved_operation.point_of_contact,
        )

    def test_industry_user_update_operation_with_declined_status(self):
        operator = operator_baker()
        operation = operation_baker()
        operation.operator_id = operator.id
        operation.status = Operation.Statuses.DECLINED
        operation.submission_date = fake_timestamp_from_past
        operation.created_by = self.user
        operation.save(update_fields=['status', 'operator_id', 'submission_date', 'created_by'])

        regulated_product = baker.make(RegulatedProduct)
        update = OperationUpdateIn(
            name='Declined Operation Name',
            type='Type',
            operator_id=operator.id,
            naics_code_id=operation.naics_code_id,
            documents=[],
            regulated_products=[regulated_product.id],
            # activity=[],
        )
        TestUtils.authorize_current_user_as_operator_user(self, operator)
        put_response = TestUtils.mock_put_with_auth_role(
            self,
            'industry_user',
            self.content_type,
            update.model_dump_json(),
            custom_reverse_lazy("v1_update_operation", kwargs={"operation_id": operation.id})
            + "?submit=true&form_section=1",
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

        operation.refresh_from_db()
        self.mock_send_boro_id_application_email.assert_called_once_with(
            application_state=BoroIdApplicationStates.CONFIRMATION,
            operator_legal_name=retrieved_operation.operator.legal_name,
            operation_name=retrieved_operation.name,
            opted_in=retrieved_operation.opt_in,
            operation_creator=retrieved_operation.created_by,
            point_of_contact=retrieved_operation.point_of_contact,
        )

    def test_industry_user_update_operation_one_form_section_at_a_time(self):
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
            naics_code_id=operation.naics_code_id,
            # activity=[1],
        )
        put_response_1 = TestUtils.mock_put_with_auth_role(
            self,
            'industry_user',
            self.content_type,
            update_from_form_section_1.model_dump_json(),
            custom_reverse_lazy("v1_update_operation", kwargs={"operation_id": operation.id})
            + "?submit=false&form_section=1",
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
            # activity=[],
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
            self.content_type,
            update_from_form_section_2.model_dump_json(),
            custom_reverse_lazy("v1_update_operation", kwargs={"operation_id": operation.id})
            + "?submit=false&form_section=2",
        )
        assert put_response_2.status_code == 200
        assert Operation.objects.count() == 1
        retrieved_op = Operation.objects.first()
        # should be 1 contacts - we updated the existing point_of_contact
        assert Contact.objects.count() == 1
        assert retrieved_op.point_of_contact.first_name == 'Bart'
        assert retrieved_op.point_of_contact_id == original_contact_id
        assert retrieved_op.name == 'New and Improved Legal Name'

    def test_only_approved_industry_users_can_update_operations(self):
        operator = operator_baker()
        operation = operation_baker(operator.id)
        user_operator = user_operator_baker(
            {'user': self.user, 'operator': operator, 'status': UserOperator.Statuses.PENDING}
        )
        mock_update_operation = TestUtils.mock_update_operation_payload()

        # PENDING user

        put_response_1 = TestUtils.mock_put_with_auth_role(
            self,
            "industry_user",
            self.content_type,
            mock_update_operation,
            custom_reverse_lazy("v1_update_operation", kwargs={"operation_id": operation.id})
            + "?submit=false&form_section=1",
        )
        assert put_response_1.status_code == 401

        # DECLINED user
        user_operator.status = UserOperator.Statuses.DECLINED

        put_response_2 = TestUtils.mock_put_with_auth_role(
            self,
            "industry_user",
            self.content_type,
            mock_update_operation,
            custom_reverse_lazy("v1_update_operation", kwargs={"operation_id": operation.id})
            + "?submit=false&form_section=1",
        )
        assert put_response_2.status_code == 401

        # APPROVED user
        user_operator.status = UserOperator.Statuses.APPROVED
        user_operator.save(update_fields=['status'])

        put_response_3 = TestUtils.mock_put_with_auth_role(
            self,
            "industry_user",
            self.content_type,
            mock_update_operation,
            custom_reverse_lazy("v1_update_operation", kwargs={"operation_id": operation.id})
            + "?submit=false&form_section=1",
        )
        assert put_response_3.status_code == 200
