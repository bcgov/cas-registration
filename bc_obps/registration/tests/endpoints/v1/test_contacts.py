from bc_obps.settings import NINJA_PAGINATION_PER_PAGE
from registration.models import Contact
from registration.schema.v1.contact import ContactIn
from registration.tests.utils.bakers import contact_baker, operator_baker
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.utils import custom_reverse_lazy
from model_bakery.recipe import seq
from itertools import cycle


class TestContactsEndpoint(CommonTestSetup):
    endpoint = CommonTestSetup.base_endpoint + "contacts"

    # AUTHORIZATION
    def test_unauthorized_roles_cannot_list_contacts(self):
        for role in ["cas_pending", "industry_user"]:  # industry_user is not approved yet
            response = TestUtils.mock_get_with_auth_role(self, role, custom_reverse_lazy("list_contacts"))
            assert response.status_code == 401
            assert response.json().get('detail') == "Unauthorized"

    # GET
    def test_contacts_endpoint_list_contacts_paginated(self):
        contact_baker(_quantity=45)
        contacts_url = custom_reverse_lazy('list_contacts')
        # Get the default page 1 response
        response = TestUtils.mock_get_with_auth_role(self, "cas_admin", contacts_url)
        assert response.status_code == 200
        response_items_1 = response.json().get('items')
        response_count_1 = response.json().get('count')
        # save the id of the first paginated response item
        page_1_response_id = response_items_1[0].get('id')
        assert len(response_items_1) == NINJA_PAGINATION_PER_PAGE
        assert response_count_1 == 45  # total count of contacts
        # Get the page 2 response
        response = TestUtils.mock_get_with_auth_role(
            self,
            "cas_admin",
            contacts_url + "?page=2&sort_field=created_at&sort_order=desc",
        )
        assert response.status_code == 200
        response_items_2 = response.json().get('items')
        response_count_2 = response.json().get('count')
        # save the id of the first paginated response item
        page_2_response_id = response_items_2[0].get('id')
        assert len(response_items_2) == NINJA_PAGINATION_PER_PAGE
        # assert that the first item in the page 1 response is not the same as the first item in the page 2 response
        assert page_1_response_id != page_2_response_id
        assert response_count_2 == response_count_1  # total count of contacts should be the same

        # Get the page 2 response but with a different sort order
        response = TestUtils.mock_get_with_auth_role(
            self,
            "cas_admin",
            contacts_url + "?page=2&sort_field=created_at&sort_order=asc",
        )
        assert response.status_code == 200
        response_items_2_reverse = response.json().get('items')
        # save the id of the first paginated response item
        page_2_response_id_reverse = response_items_2_reverse[0].get('id')
        assert len(response_items_2_reverse) == NINJA_PAGINATION_PER_PAGE
        # assert that the first item in the page 2 response is not the same as the first item in the page 2 response with reversed order
        assert page_2_response_id != page_2_response_id_reverse

        # make sure sorting is working
        page_2_first_contact = Contact.objects.get(pk=page_2_response_id)
        page_2_first_contact_reverse = Contact.objects.get(pk=page_2_response_id_reverse)
        assert page_2_first_contact.created_at > page_2_first_contact_reverse.created_at

    def test_contacts_endpoint_list_contacts_with_filter(self):
        contacts_url = custom_reverse_lazy('list_contacts')
        contact_baker(
            _quantity=30,
            first_name=cycle(["John", "Jane"]),
            last_name=seq("Doe"),
            email=seq("test_user", suffix="@example.com"),
        )

        # Get the default page 1 response
        response = TestUtils.mock_get_with_auth_role(
            self, "cas_admin", contacts_url + "?first_name=Jane"
        )  # filtering first_name with Jane
        assert response.status_code == 200
        response_items_1 = response.json().get('items')
        for item in response_items_1:
            assert item.get('first_name') == "Jane"

        # Test with a type filter that doesn't exist
        response = TestUtils.mock_get_with_auth_role(
            self, "cas_admin", contacts_url + "?first_name=John&last_name=Smith"
        )
        assert response.status_code == 200
        assert response.json().get('count') == 0

        # Test with a first_name and last_name filter
        first_name_to_filter, last_name_to_filter = response_items_1[0].get('first_name'), response_items_1[0].get(
            'last_name'
        )
        response = TestUtils.mock_get_with_auth_role(
            self, "cas_admin", contacts_url + f"?first_name={first_name_to_filter}&last_name={last_name_to_filter}"
        )
        assert response.status_code == 200
        response_items_2 = response.json().get('items')
        assert len(response_items_2) == 1
        assert response.json().get('count') == 1
        assert response_items_2[0].get('first_name') == first_name_to_filter
        assert response_items_2[0].get('last_name') == last_name_to_filter

    # AUTHORIZATION
    def test_unauthorized_roles_cannot_create_new_contact(self):
        mock_contact = ContactIn.from_orm(contact_baker()).dict()
        # IRC users can't post
        for role in ['cas_pending', 'cas_admin', 'cas_analyst']:
            response = TestUtils.mock_post_with_auth_role(
                self, role, self.content_type, mock_contact, custom_reverse_lazy("create_contact")
            )
            assert response.status_code == 401

    def test_unapproved_industry_users_cannot_create_new_contact(self):
        mock_contact = ContactIn.from_orm(contact_baker()).dict()
        response = TestUtils.mock_post_with_auth_role(
            self, "industry_user", self.content_type, mock_contact, custom_reverse_lazy("create_contact")
        )
        assert response.status_code == 401

    # POST
    def test_post_new_malformed_contact(self):
        TestUtils.authorize_current_user_as_operator_user(self, operator_baker())
        response = TestUtils.mock_post_with_auth_role(
            self, "industry_user", self.content_type, {"garbage": "i am bad data"}
        )
        assert response.status_code == 422

    def test_post_new_contact(self):
        operator = operator_baker()
        mock_contact = {
            "first_name": "John",
            "last_name": "Doe",
            "email": "john.doe@email.com",
            "phone_number": "+16044011234",
            "position_title": "Mr.Tester",
            "street_address": "1234 Test St",
        }
        TestUtils.authorize_current_user_as_operator_user(self, operator)
        post_response = TestUtils.mock_post_with_auth_role(
            self,
            "industry_user",
            self.content_type,
            mock_contact,
            custom_reverse_lazy("create_contact"),
        )
        assert post_response.status_code == 201
        response_json = post_response.json()
        assert response_json.get('first_name') == mock_contact.get('first_name')
        assert response_json.get('last_name') == mock_contact.get('last_name')
        assert response_json.get('email') == mock_contact.get('email')
        assert response_json.get('phone_number') == mock_contact.get('phone_number')
        assert response_json.get('position_title') == mock_contact.get('position_title')
        assert response_json.get('street_address') == mock_contact.get('street_address')
        assert response_json.get('municipality') == mock_contact.get('municipality')
        assert response_json.get('province') == mock_contact.get('province')
        assert response_json.get('postal_code') == mock_contact.get('postal_code')

        assert Contact.objects.count() == 1
        assert operator.contacts.count() == 1
        created_contact = Contact.objects.first()
        assert (
            created_contact.business_role.role_name == "Operation Representative"
        )  # default business role when creating a contact
        assert created_contact == operator.contacts.first()  # contact is associated with the operator
        assert created_contact.address.street_address == mock_contact.get(
            'street_address'
        )  # confirm that an address was created(even with only street_address)
