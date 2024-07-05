from bc_obps.settings import NINJA_PAGINATION_PER_PAGE
from registration.models import Contact
from registration.tests.utils.bakers import contact_baker
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.utils import custom_reverse_lazy
from model_bakery.recipe import seq
from itertools import cycle
from registration.constants import UNAUTHORIZED_MESSAGE


class TestContactsEndpoint(CommonTestSetup):
    endpoint = CommonTestSetup.base_endpoint + "contacts"

    # AUTHORIZATION
    def test_unauthorized_roles_cannot_list_contacts(self):
        for role in ["cas_pending", "industry_user"]:  # industry_user is not approved yet
            response = TestUtils.mock_get_with_auth_role(self, role, custom_reverse_lazy("list_contacts"))
            assert response.status_code == 401
            assert response.json().get('detail') == UNAUTHORIZED_MESSAGE

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
