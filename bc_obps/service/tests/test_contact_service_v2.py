from registration.schema.v1.contact import ContactFilterSchema
import pytest
from service.contact_service_v2 import ContactServiceV2
from model_bakery import baker

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
