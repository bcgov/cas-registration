from registration.schema.v1.contact import ContactFilterSchema
import pytest
from service.contact_service_v2 import ContactServiceV2
from model_bakery import baker
from registration.models.business_role import BusinessRole
import pytest
from model_bakery import baker
from service.contact_service_v2 import ContactServiceV2

pytestmark = pytest.mark.django_db


class TestListContactService:
    @staticmethod
    def test_list_contacts():

        user = baker.make_recipe('utils.cas_admin')
        contact1 = baker.make_recipe('utils.contact')
        contact2 = baker.make_recipe('utils.contact')

        operator1 = baker.make_recipe('utils.operator')

        operator2a = baker.make_recipe('utils.operator')
        operator2b = baker.make_recipe('utils.operator')

        # contact 1 is associated with one operator, count = 1
        operator1.contacts.set([contact1])

        # contact 2 belongs to two operators count = 3
        operator2a.contacts.set([contact2])
        operator2b.contacts.set([contact2])
        assert (
            ContactServiceV2.list_contacts_v2(
                user_guid=user.user_guid, sort_field="created_at", sort_order="desc", filters=ContactFilterSchema()
            ).count()
            == 3
        )


class TestContactService:
    @staticmethod
    def test_get_with_places_assigned_with_contacts():
        contact = baker.make_recipe(
            'utils.contact', business_role=BusinessRole.objects.get(role_name='Operation Representative')
        )
        approved_user_operator = baker.make_recipe('utils.approved_user_operator')
        # add contact to operator (they have to be associated with the operator or will throw unauthorized)
        approved_user_operator.operator.contacts.set([contact])
        # add contact to operation
        operation = baker.make_recipe('utils.operation', operator=approved_user_operator.operator)
        operation.contacts.set([contact])

        result = ContactServiceV2.get_with_places_assigned_v2(approved_user_operator.user.user_guid, contact.id)
        assert result.places_assigned == [
            f"Operation Representative - {operation.name}",
        ]

    @staticmethod
    def test_get_with_places_assigned_with_no_contacts():
        contact = baker.make_recipe(
            'utils.contact', business_role=BusinessRole.objects.get(role_name='Operation Representative')
        )
        approved_user_operator = baker.make_recipe('utils.approved_user_operator')
        # add contact to operator (they have to be associated with the operator or will throw unauthorized)
        approved_user_operator.operator.contacts.set([contact])

        result = ContactServiceV2.get_with_places_assigned_v2(approved_user_operator.user.user_guid, contact.id)
        assert not hasattr(result, 'places_assigned')
