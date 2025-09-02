from typing import List
import pytest
from registration.models.app_role import AppRole
from registration.models.contact import Contact
from registration.tests.utils.bakers import (
    contact_baker,
    operator_baker,
    user_baker,
    user_operator_baker,
)
from registration.models.user_operator import UserOperator
from model_bakery import baker
from service.data_access_service.contact_service import ContactDataAccessService

pytestmark = pytest.mark.django_db


class TestDataAccessContactService:
    @staticmethod
    def test_list_contacts_for_irc_user():
        baker.make_recipe('registration.tests.utils.contact', _quantity=10)
        user = baker.make_recipe('registration.tests.utils.cas_admin')
        assert ContactDataAccessService.get_all_contacts_for_user(user).count() == 10

    @staticmethod
    def test_list_contacts_for_industry_user():
        industry_user = user_baker({'app_role': AppRole.objects.get(role_name='industry_user')})
        # Generating 10 operations for the industry user and assigning contacts to them
        users_operator = operator_baker()
        users_contacts: List[Contact] = contact_baker(_quantity=10)
        users_operator.contacts.set(users_contacts)
        # Approved user operator for industry user
        user_operator_baker(
            {"user": industry_user, "operator": users_operator, "status": UserOperator.Statuses.APPROVED}
        )

        # Generating 10 operations for a random user and assigning contacts to them
        random_contacts: List[Contact] = contact_baker(_quantity=10)
        random_operator = operator_baker()
        random_operator.contacts.set(random_contacts)

        industry_user_contacts = ContactDataAccessService.get_all_contacts_for_user(industry_user)
        assert Contact.objects.count() == 20
        assert industry_user_contacts.count() == 10
        # make sure user's contacts are only from their operations
        assert all(contact in users_contacts for contact in industry_user_contacts)

    @staticmethod
    def test_user_has_access():
        user = user_baker()
        contact = contact_baker()
        operator = operator_baker()
        operator.contacts.set([contact])
        user_operator_baker({"user": user, "operator": operator, "status": UserOperator.Statuses.APPROVED})
        assert ContactDataAccessService.user_has_access(user.user_guid, contact.id)

    @staticmethod
    def test_get_contact_for_internal_user_returns_none():
        internal_user = user_baker({'app_role': AppRole.objects.get(role_name='cas_analyst')})
        assert ContactDataAccessService.get_contact_for_user(internal_user) is None

    @staticmethod
    def test_get_contact_for_industry_user_by_unique_email_returns_contact():
        industry_user = user_baker(
            {
                'app_role': AppRole.objects.get(role_name='industry_user'),
                'first_name': 'Mickey',
                'last_name': 'Mouse',
                'email': 'mickey.mouse@email.com',
            }
        )
        users_operator = operator_baker()
        random_contacts: List[Contact] = contact_baker(_quantity=10)
        user_contact: Contact = contact_baker(first_name='Mickey', last_name='Mouse', email='mickey.mouse@email.com')
        users_operator.contacts.set([*random_contacts, user_contact])
        user_operator_baker(
            {"user": industry_user, "operator": users_operator, "status": UserOperator.Statuses.APPROVED}
        )
        contact = ContactDataAccessService.get_contact_for_user(industry_user)
        print(str(contact))
        assert contact.email == 'mickey.mouse@email.com'
        assert contact.first_name == 'Mickey'
        assert contact.last_name == 'Mouse'

    @staticmethod
    def test_get_contact_for_industry_user_by_name_returns_contact():
        industry_user = user_baker(
            {
                'app_role': AppRole.objects.get(role_name='industry_user'),
                'first_name': 'Mickey',
                'last_name': 'Mouse',
                'email': 'mickey.mouse@email.com',
            }
        )
        users_operator = operator_baker()
        random_contacts: List[Contact] = contact_baker(_quantity=10)
        user_contact: Contact = contact_baker(
            first_name='Mickey', last_name='Mouse', email='some.other.address@email.com'
        )
        users_operator.contacts.set([*random_contacts, user_contact])
        user_operator_baker(
            {"user": industry_user, "operator": users_operator, "status": UserOperator.Statuses.APPROVED}
        )
        contact = ContactDataAccessService.get_contact_for_user(industry_user)
        assert contact.first_name == 'Mickey'
        assert contact.last_name == 'Mouse'
