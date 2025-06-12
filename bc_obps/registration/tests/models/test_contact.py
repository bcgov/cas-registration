from django.db import ProgrammingError, transaction
from django.test import TestCase
from common.tests.utils.helpers import BaseTestCase
from registration.models import Contact, BusinessRole
from registration.tests.constants import (
    ADDRESS_FIXTURE,
    OPERATOR_FIXTURE,
    CONTACT_FIXTURE,
    USER_FIXTURE,
    TIMESTAMP_COMMON_FIELDS,
)
from model_bakery import baker


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


class ContactTriggerTests(TestCase):
    def setUp(self):
        self.op_rep_contact = baker.make_recipe(
            "registration.tests.utils.contact",
            business_role=BusinessRole.objects.get(role_name='Operation Representative'),
        )
        self.senior_officer_contact = baker.make_recipe(
            "registration.tests.utils.contact", business_role=BusinessRole.objects.get(role_name='Senior Officer')
        )
        self.null_address_contact = baker.make_recipe("registration.tests.utils.contact", address=None)

    def test_prevent_address_null_for_op_rep(self):
        """Test that updating address to NULL fails for Operation Representative."""
        with transaction.atomic():
            with self.assertRaises(ProgrammingError) as cm:
                self.op_rep_contact.address = None
                self.op_rep_contact.save()

            self.assertIn(
                "Cannot set address to NULL for a contact with role Operation Representative", str(cm.exception)
            )

        # Verify the address wasn’t changed
        self.op_rep_contact.refresh_from_db()
        self.assertIsNotNone(self.op_rep_contact.address, "Address was set to NULL for Operation Representative")

    def test_allow_address_null_for_non_op_rep(self):
        """Test that updating address to NULL succeeds for non-Operation Representative."""
        self.senior_officer_contact.address = None
        self.senior_officer_contact.save()

        # Verify the address is now NULL
        self.senior_officer_contact.refresh_from_db()
        self.assertIsNone(self.senior_officer_contact.address)

    def test_allow_address_change_to_non_null_for_op_rep(self):
        """Test that updating address to a different non-NULL value succeeds for Operation Representative."""
        new_address = baker.make_recipe("registration.tests.utils.address")
        self.op_rep_contact.address = new_address
        self.op_rep_contact.save()

        # Verify the address was updated
        self.op_rep_contact.refresh_from_db()
        self.assertEqual(self.op_rep_contact.address, new_address)

    def test_no_trigger_on_other_field_update(self):
        """Test that updating a non-address field doesn’t trigger the restriction."""
        self.op_rep_contact.email = "new_op_rep@example.com"
        self.op_rep_contact.save()

        # Verify the email was updated and address unchanged
        self.op_rep_contact.refresh_from_db()
        self.assertEqual(self.op_rep_contact.email, "new_op_rep@example.com")
        self.assertIsNotNone(self.op_rep_contact.address)

    def test_no_trigger_when_address_already_null(self):
        """Test that updating a contact with NULL address doesn’t trigger if address stays NULL."""
        # Update another field
        self.null_address_contact.email = "updated_null_op_rep@example.com"
        self.null_address_contact.save()

        # Verify the update succeeded and address is still NULL
        self.null_address_contact.refresh_from_db()
        self.assertEqual(self.null_address_contact.email, "updated_null_op_rep@example.com")
        self.assertIsNone(self.null_address_contact.address)
