from typing import Dict
from registration.models import UserOperator
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.tests.utils.bakers import contact_baker, operator_baker, user_operator_baker
from registration.utils import custom_reverse_lazy


class TestContactIdEndpoint(CommonTestSetup):
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
