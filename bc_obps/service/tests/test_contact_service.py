from registration.models.contact import Contact
from registration.schema.v1.contact import ContactIn
import pytest
from registration.models.app_role import AppRole
from registration.tests.utils.bakers import (
    contact_baker,
    user_operator_baker,
)
from registration.constants import UNAUTHORIZED_MESSAGE
from registration.models.user import User
from registration.models.user_operator import UserOperator
from registration.tests.utils.bakers import operator_baker
from service.contact_service import ContactService
from model_bakery import baker

pytestmark = pytest.mark.django_db


class TestContactService:
    @staticmethod
    def test_get_contact_if_authorized_cas_user_success():
        user = baker.make(User, app_role=AppRole.objects.get(role_name="cas_analyst"))
        contact = contact_baker()
        result = ContactService.get_if_authorized(user.user_guid, contact.id)
        assert result == contact

    @staticmethod
    def test_get_contact_if_authorized_industry_user_success():
        user = baker.make(User, app_role=AppRole.objects.get(role_name="industry_user"))
        operator = operator_baker()
        contact = contact_baker()
        operator.contacts.set([contact])
        user_operator_baker(
            {
                "user": user,
                "operator": operator,
                "status": UserOperator.Statuses.APPROVED,
                "role": UserOperator.Roles.ADMIN,
            }
        )
        result = ContactService.get_if_authorized(user.user_guid, contact.id)
        assert result == contact

    @staticmethod
    def test_get_contact_if_authorized_industry_user_fail():
        user = baker.make(User, app_role=AppRole.objects.get(role_name="industry_user"))
        contact = contact_baker()
        owning_operator = operator_baker()
        owning_operator.contacts.set([contact])
        random_operator = operator_baker()
        user_operator_baker(
            {
                "user": user,
                "operator": random_operator,
                "status": UserOperator.Statuses.APPROVED,
                "role": UserOperator.Roles.ADMIN,
            }
        )
        with pytest.raises(Exception, match=UNAUTHORIZED_MESSAGE):
            ContactService.get_if_authorized(user.user_guid, contact.id)

    @staticmethod
    def test_create_contact():
        operator = operator_baker()
        user = baker.make(User, app_role=AppRole.objects.get(role_name="industry_user"))
        user_operator_baker(
            {
                "user": user,
                "operator": operator,
                "status": UserOperator.Statuses.APPROVED,
                "role": UserOperator.Roles.ADMIN,
            }
        )
        contact_payload = ContactIn(
            first_name="John",
            last_name="Doe",
            email="john.doe@email.com",
            phone_number="+16044011234",
            position_title="Mr.Tester",
            street_address="1234 Test St",
        )

        ContactService.create_contact(user.user_guid, contact_payload)
        assert Contact.objects.count() == 1
        assert operator.contacts.count() == 1  # contact is associated with the operator
        created_contact = Contact.objects.first()
        assert created_contact.first_name == contact_payload.first_name
        assert created_contact.last_name == contact_payload.last_name
        assert created_contact.email == contact_payload.email
        assert created_contact.phone_number == contact_payload.phone_number
        assert created_contact.position_title == contact_payload.position_title
        assert (
            created_contact.business_role.role_name == "Operation Representative"
        )  # default business role when creating a contact
        assert (
            created_contact.address.street_address == contact_payload.street_address
        )  # address is created and associated with the contact
