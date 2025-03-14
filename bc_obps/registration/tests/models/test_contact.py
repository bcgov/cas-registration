from common.tests.utils.helpers import BaseTestCase
from registration.models import (
    Contact,
)
from registration.tests.constants import (
    ADDRESS_FIXTURE,
    OPERATOR_FIXTURE,
    CONTACT_FIXTURE,
    USER_FIXTURE,
    TIMESTAMP_COMMON_FIELDS,
)


class ContactModelTest(BaseTestCase):
    fixtures = [ADDRESS_FIXTURE, USER_FIXTURE, CONTACT_FIXTURE, OPERATOR_FIXTURE]

    @classmethod
    def setUpTestData(cls):
        cls.test_object = Contact.objects.get(id=1)
        cls.field_data = [
            *TIMESTAMP_COMMON_FIELDS,
            ("id", "ID", None, None),
            ("first_name", "first name", 1000, None),
            ("last_name", "last name", 1000, None),
            ("position_title", "position title", 1000, None),
            ("address", "address", None, None),
            ("email", "email", 254, None),
            (
                "phone_number",
                "phone number",
                None,
                None,
            ),  # Replace None with the actual max length if available
            ("business_role", "business role", None, None),
            ("operator", "operator", None, None),
            # operation model has contacts (m2m)
            ("operations_contacts", "operation", None, None),
        ]
