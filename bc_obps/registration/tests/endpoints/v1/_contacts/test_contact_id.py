from typing import Dict
from registration.models import UserOperator
from registration.models.address import Address
from registration.models.contact import Contact
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.tests.utils.bakers import address_baker, contact_baker, operator_baker, user_operator_baker
from registration.utils import custom_reverse_lazy


class TestContactIdEndpoint(CommonTestSetup):
    def setup_method(self):
        super().setup_method()
        # primarily used for PUT requests
        self.valid_contact_data = {
            "first_name": "John",
            "last_name": "Doe",
            "email": "john.doe@example.com",
            "phone_number": "+16044011234",
            "position_title": "Mr.Tester",
            "street_address": "1234 Test St",
            "municipality": "Fakeville",
            "province": "BC",
            "postal_code": "H1H1H1",
        }

    def test_contacts_endpoint_unauthorized_roles_cannot_get(self):
        contact = contact_baker()
        # cas_pending can't get
        response = TestUtils.mock_get_with_auth_role(
            self, "cas_pending", custom_reverse_lazy("get_contact", kwargs={"contact_id": contact.id})
        )
        assert response.status_code == 401

        # unapproved industry users can't get
        user_operator_instance = user_operator_baker(
            {
                'status': UserOperator.Statuses.PENDING,
            }
        )
        user_operator_instance.user_id = self.user.user_guid
        user_operator_instance.save()

        response = TestUtils.mock_get_with_auth_role(
            self,
            "industry_user",
            custom_reverse_lazy("get_contact", kwargs={"contact_id": contact.id}),
        )
        assert response.status_code == 401

    def test_industry_users_can_get_contacts_associated_with_their_operator(self):
        contact = contact_baker()
        operator = operator_baker()
        TestUtils.authorize_current_user_as_operator_user(self, operator)
        # add contact to operator
        operator.contacts.add(contact)

        response = TestUtils.mock_get_with_auth_role(
            self,
            endpoint=custom_reverse_lazy("get_contact", kwargs={"contact_id": contact.id}),
            role_name="industry_user",
        )
        assert response.status_code == 200
        response_json: Dict = response.json()
        assert response_json.get('first_name') == contact.first_name
        assert response_json.get('last_name') == contact.last_name
        assert response_json.get('email') == contact.email

    def test_industry_users_cannot_get_contacts_not_associated_with_their_operator(self):
        contact = contact_baker()
        operator = operator_baker()
        TestUtils.authorize_current_user_as_operator_user(self, operator)

        response = TestUtils.mock_get_with_auth_role(
            self,
            endpoint=custom_reverse_lazy("get_contact", kwargs={"contact_id": contact.id}),
            role_name="industry_user",
        )
        assert response.status_code == 401
        assert response.json().get('message') == 'Unauthorized.'

    # PUT
    def test_unauthorized_roles_cannot_update_contact(self):
        # Only approved industry users can update contacts
        contact = contact_baker()
        for role in ['cas_pending', 'cas_admin', 'cas_analyst', 'industry_user']:
            response = TestUtils.mock_put_with_auth_role(
                self,
                role,
                self.content_type,
                self.valid_contact_data,
                custom_reverse_lazy("update_contact", kwargs={"contact_id": contact.id}),
            )
            assert response.status_code == 401

    def test_industry_users_admin_can_not_update_contacts_not_associated_with_their_operator(self):
        contact = contact_baker()
        operator = operator_baker()
        # Not adding contact to operator
        TestUtils.authorize_current_user_as_operator_user(self, operator)
        response = TestUtils.mock_put_with_auth_role(
            self,
            "industry_user",
            self.content_type,
            self.valid_contact_data,
            custom_reverse_lazy("update_contact", kwargs={"contact_id": contact.id}),
        )
        assert response.status_code == 401
        assert response.json().get('message') == 'Unauthorized.'

    def test_industry_user_admin_cannot_update_contact_with_malformed_date(self):
        contact = contact_baker()
        operator = operator_baker()
        operator.contacts.add(contact)
        TestUtils.authorize_current_user_as_operator_user(self, operator)
        contact_data = {
            "first_name": "John",
            "last_name": "Doe",
            "email": "john.doe",  # Malformed email
            "phone_number": "+16044011234",
            "position_title": "Mr.Tester",
            "street_address": "1234 Test St",
        }
        response = TestUtils.mock_put_with_auth_role(
            self,
            "industry_user",
            self.content_type,
            contact_data,
            custom_reverse_lazy("update_contact", kwargs={"contact_id": contact.id}),
        )
        assert response.status_code == 422
        assert response.json().get('message') == 'Email: Enter a valid email address.'

    def test_industry_user_admin_update_contact_and_address(self):
        contact = contact_baker(address=address_baker())
        operator = operator_baker()
        operator.contacts.add(contact)
        TestUtils.authorize_current_user_as_operator_user(self, operator)
        # Assert that we have only one contact(to make sure we are updating the contact and not creating a new one)
        assert Contact.objects.count() == 1
        # Assert that we are not creating a new address
        assert Address.objects.count() == 2  # One for the contact and one for the operator

        response = TestUtils.mock_put_with_auth_role(
            self,
            "industry_user",
            self.content_type,
            self.valid_contact_data,
            custom_reverse_lazy("update_contact", kwargs={"contact_id": contact.id}),
        )
        assert response.status_code == 200

        # Assert that we have only one contact(to make sure we are updating the contact and not creating a new one)
        assert Contact.objects.count() == 1
        # Assert that we have only one address(to make sure we are updating the address and not creating a new one)
        assert Address.objects.count() == 2  # One for the contact and one for the operator

        response_json: Dict = response.json()
        assert response_json.get('first_name') == self.valid_contact_data.get('first_name')
        assert response_json.get('last_name') == self.valid_contact_data.get('last_name')
        assert response_json.get('email') == self.valid_contact_data.get('email')
        assert response_json.get('phone_number') == self.valid_contact_data.get('phone_number')
        assert response_json.get('position_title') == self.valid_contact_data.get('position_title')
        assert response_json.get('street_address') == self.valid_contact_data.get('street_address')
        assert response_json.get('municipality') == self.valid_contact_data.get('municipality')
        assert response_json.get('province') == self.valid_contact_data.get('province')
        assert response_json.get('postal_code') == self.valid_contact_data.get('postal_code')

    def test_industry_user_admin_update_contact_and_remove_address(self):
        contact = contact_baker(address=address_baker())
        operator = operator_baker()
        operator.contacts.add(contact)
        TestUtils.authorize_current_user_as_operator_user(self, operator)
        # Assert that we have only one contact(to make sure we are updating the contact and not creating a new one)
        assert Contact.objects.count() == 1
        # Assert that we are not creating a new address
        assert Address.objects.count() == 2

        contact_data_no_address = {
            "first_name": "John",
            "last_name": "Doe",
            "email": "john.doe@example.com",
            "phone_number": "+16044011234",
            "position_title": "Mr.Tester",
        }

        response = TestUtils.mock_put_with_auth_role(
            self,
            "industry_user",
            self.content_type,
            contact_data_no_address,
            custom_reverse_lazy("update_contact", kwargs={"contact_id": contact.id}),
        )
        assert response.status_code == 200
        assert Contact.objects.count() == 1
        assert Address.objects.count() == 1  # One for the operator

        response_json: Dict = response.json()
        assert response_json.get('first_name') == contact_data_no_address.get('first_name')
        assert response_json.get('last_name') == contact_data_no_address.get('last_name')
        assert response_json.get('email') == contact_data_no_address.get('email')
        assert response_json.get('phone_number') == contact_data_no_address.get('phone_number')
        assert response_json.get('position_title') == contact_data_no_address.get('position_title')
        assert response_json.get('street_address') is None
        assert response_json.get('municipality') is None
        assert response_json.get('province') is None
        assert response_json.get('postal_code') is None
        assert Contact.objects.first().address is None

    def test_industry_user_admin_update_contact_by_adding_address(self):
        contact = contact_baker()  # No address
        operator = operator_baker()
        operator.contacts.add(contact)
        TestUtils.authorize_current_user_as_operator_user(self, operator)
        # Assert that we have only one contact(to make sure we are updating the contact and not creating a new one)
        assert Contact.objects.count() == 1
        # Assert that we are not creating a new address
        assert Address.objects.count() == 1  # One for the operator

        response = TestUtils.mock_put_with_auth_role(
            self,
            "industry_user",
            self.content_type,
            self.valid_contact_data,
            custom_reverse_lazy("update_contact", kwargs={"contact_id": contact.id}),
        )
        assert response.status_code == 200
        assert Contact.objects.count() == 1
        assert Address.objects.count() == 2  # One for the contact and one for the operator

        response_json: Dict = response.json()
        assert response_json.get('first_name') == self.valid_contact_data.get('first_name')
        assert response_json.get('last_name') == self.valid_contact_data.get('last_name')
        assert response_json.get('email') == self.valid_contact_data.get('email')
        assert response_json.get('phone_number') == self.valid_contact_data.get('phone_number')
        assert response_json.get('position_title') == self.valid_contact_data.get('position_title')
        assert response_json.get('street_address') == self.valid_contact_data.get('street_address')
        assert response_json.get('municipality') == self.valid_contact_data.get('municipality')
        assert response_json.get('province') == self.valid_contact_data.get('province')
        assert response_json.get('postal_code') == self.valid_contact_data.get('postal_code')
        assert Contact.objects.first().address is not None
