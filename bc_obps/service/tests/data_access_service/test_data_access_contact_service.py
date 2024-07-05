from typing import List
import pytest
from registration.models.app_role import AppRole
from registration.models.contact import Contact
from registration.models.operation import Operation
from registration.tests.utils.bakers import (
    contact_baker,
    operation_baker,
    operator_baker,
    user_baker,
    user_operator_baker,
)
from registration.models.user_operator import UserOperator
from service.data_access_service.contact_service import ContactDataAccessService

pytestmark = pytest.mark.django_db


class TestDataAccessContactService:
    @staticmethod
    def test_list_contacts_for_irc_user():
        contact_baker(_quantity=10)
        irc_user = user_baker({'app_role': AppRole.objects.get(role_name='cas_admin')})
        assert ContactDataAccessService.get_all_contacts_for_user(irc_user).count() == 10

    @staticmethod
    def test_list_contacts_for_industry_user():
        industry_user = user_baker({'app_role': AppRole.objects.get(role_name='industry_user')})
        # Generating 10 operations for the industry user and assigning contacts to them
        users_operator = operator_baker()
        users_contacts: List[Contact] = contact_baker(_quantity=10)
        users_operations: List[Operation] = []
        for user_contact in users_contacts:
            users_operations.append(operation_baker(operator_id=users_operator.id, point_of_contact=user_contact))
        # Approved user operator for industry user
        user_operator_baker(
            {"user": industry_user, "operator": users_operator, "status": UserOperator.Statuses.APPROVED}
        )

        # Generating 10 operations for a random user and assigning contacts to them
        random_contacts: List[Contact] = contact_baker(_quantity=10)
        random_operations: List[Operation] = []
        for random_contact in random_contacts:
            random_operations.append(operation_baker(point_of_contact=random_contact))

        industry_user_contacts = ContactDataAccessService.get_all_contacts_for_user(industry_user)
        assert Contact.objects.count() == 20
        assert industry_user_contacts.count() == 10
        # make sure user's contacts are only from their operations
        assert all(contact in users_contacts for contact in industry_user_contacts)
