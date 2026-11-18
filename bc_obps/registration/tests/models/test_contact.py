from django.db import ProgrammingError, transaction, IntegrityError
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
from datetime import datetime, timezone
from model_bakery.baker import make_recipe
from rls.tests.helpers import assert_policies_for_cas_roles, assert_policies_for_industry_user


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
            # relation from ReportPersonResponsible.contact FK
            ("report_person_responsibles", "report person responsible", None, None),
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

    def test_duplicate_email_for_same_operator_not_allowed(self):
        """Test that can't create 2 contacts for same operator with same email address"""
        with transaction.atomic():
            with self.assertRaises(IntegrityError):
                baker.make_recipe(
                    "registration.tests.utils.contact",
                    email=self.senior_officer_contact.email,
                    operator=self.senior_officer_contact.operator,
                )

    def test_duplicate_email_for_same_operator_when_contact_archived(self):
        """Test that can create a new contact for an operator when an archived contact with the same email address already exists"""
        # First archive the existing contact
        self.senior_officer_contact.archived_at = datetime.now(timezone.utc)
        self.senior_officer_contact.save(update_fields=["archived_at"])
        self.senior_officer_contact.refresh_from_db()

        # Now create a new contact with the same email address
        new_contact = baker.make_recipe(
            "registration.tests.utils.contact",
            email=self.senior_officer_contact.email,
            operator=self.senior_officer_contact.operator,
        )

        # assert that new_contact created OK
        self.assertIsNotNone(new_contact.id)


class ContactRlsTest(BaseTestCase):

    def test_contact_rls_industry_user(self):
        approved_user_operator = make_recipe('registration.tests.utils.approved_user_operator')
        approved_operator = approved_user_operator.operator
        other_operator = make_recipe('registration.tests.utils.operator')
        approved_contact = make_recipe('registration.tests.utils.contact', operator=approved_operator)
        other_contact = make_recipe('registration.tests.utils.contact', operator=other_operator)

        def select_function(cursor):
            Contact.objects.get(id=approved_contact.id)

        def forbidden_select_function(cursor):
            Contact.objects.get(id=other_contact.id)

        def insert_function(cursor):
            Contact.objects.create(
                business_role=BusinessRole.objects.first(),
                operator=approved_operator,
                first_name="fname",
                last_name="lname",
                position_title="Manager",
                email="alicesmith@example.com",
                phone_number="+16044011234",
            )

        def forbidden_insert_function(cursor):
            Contact.objects.create(
                business_role=BusinessRole.objects.first(),
                operator=other_operator,
                first_name="fname",
                last_name="lname",
                position_title="Manager",
                email="alicesmith@example.com",
                phone_number="+16044011234",
            )

        def update_function(cursor):
            cursor.execute(
                """
                    UPDATE "erc"."contact"
                    SET first_name = 'updated'
                    WHERE id = %s
                """,
                (str(approved_contact.id),),
            )
            return cursor.rowcount

        def forbidden_update_function(cursor):
            cursor.execute(
                """
                    UPDATE "erc"."contact"
                    SET first_name = 'updated'
                    WHERE id = %s
                """,
                (str(other_contact.id),),
            )
            return cursor.rowcount

        assert_policies_for_industry_user(
            Contact,
            approved_user_operator.user,
            select_function=select_function,
            insert_function=insert_function,
            update_function=update_function,
            forbidden_select_function=forbidden_select_function,
            forbidden_insert_function=forbidden_insert_function,
            forbidden_update_function=forbidden_update_function,
        )

    def test_contact_rls_cas_user(self):
        other_operator = make_recipe('registration.tests.utils.operator')
        test_quantity = 2
        make_recipe(
            "registration.tests.utils.contact",
        )
        make_recipe(
            "registration.tests.utils.contact",
        )

        def select_function(cursor):
            assert Contact.objects.count() == test_quantity

        def insert_function(cursor):
            Contact.objects.create(
                business_role=BusinessRole.objects.first(),
                operator=other_operator,
                first_name="fname",
                last_name="lname",
                position_title="Manager",
                email="alicesmith@example.com",
                phone_number="+16044011234",
            )

        assert_policies_for_cas_roles(
            Contact,
            select_function=select_function,
            insert_function=insert_function,
        )
