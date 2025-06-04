from django.db import ProgrammingError, transaction
from django.test import TestCase
from common.tests.utils.helpers import BaseTestCase
import pytest
from registration.models import Contact, BusinessRole
from registration.tests.constants import (
    ADDRESS_FIXTURE,
    OPERATOR_FIXTURE,
    CONTACT_FIXTURE,
    USER_FIXTURE,
    TIMESTAMP_COMMON_FIELDS,
)
from model_bakery import baker
from rls.tests.helpers import test_policies_for_cas_roles, test_policies_for_industry_user


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


# RLS tests
class TestContactRls(BaseTestCase):
    def _create_insert_statement(operator_id: str):
        return (
            """
        INSERT INTO "erc"."contact" (
            first_name,
            last_name,
            position_title,
            email,
            phone_number,
            business_role_id,
            operator_id
        ) VALUES (
            %s,
            %s,
            %s,
            %s,
            %s,
            %s,
            %s
        )
        """,
            (
                'John',
                'Doe',
                'Manager',
                'john.doe@example.com',
                '12505800000',
                'Operation Representative',
                operator_id,
            ),
        )

    def test_contact_rls_industry_user_success(self):
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')
        contact = baker.make_recipe('registration.tests.utils.contact', operator=approved_user_operator.operator)
        random_contact = baker.make_recipe(
            'registration.tests.utils.contact', operator=baker.make_recipe('registration.tests.utils.operator')
        )

        def select_function(cursor):
            cursor.execute("select count(*) from erc.contact")
            assert cursor.fetchone()[0] == 1  # Industry user should see only their contact

        def insert_function(cursor):
            sql, params = TestContactRls._create_insert_statement(approved_user_operator.operator.id)
            cursor.execute(sql, params)
            assert cursor.rowcount == 1

        def update_function(cursor):
            cursor.execute(
                """
                UPDATE "erc"."contact"
                SET first_name = %s
                WHERE id = %s
            """,
                ('Updated first name', contact.id),
            )
            assert cursor.rowcount == 1

        test_policies_for_industry_user(
            Contact, approved_user_operator.user, select_function, insert_function, update_function
        )

    def test_contact_rls_industry_user_fail(self):
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')
        random_contact = baker.make_recipe(
            'registration.tests.utils.contact', operator=baker.make_recipe('registration.tests.utils.operator')
        )

        def select_function(cursor):
            cursor.execute("select count(*) from erc.contact where id = %s", [random_contact.id])
            assert cursor.fetchone()[0] == 0  # User should not be able to see another operator's contact

        def insert_function(cursor):
            with pytest.raises(ProgrammingError, match='new row violates row-level security policy for table "contact'):
                with transaction.atomic():
                    sql, params = TestContactRls._create_insert_statement(random_contact.operator.id)
                    cursor.execute(sql, params)

        def update_function(cursor):

            cursor.execute(
                """
                            UPDATE "erc"."contact"
                            SET first_name = %s
                            WHERE id = %s
                        """,
                ('Updated first name', random_contact.id),
            )
            assert cursor.rowcount == 0  # User should not be able to update another operator's contact

        test_policies_for_industry_user(
            Contact, approved_user_operator.user, select_function, insert_function, update_function
        )

    def test_contact_rls_cas_users(self):

        contacts = baker.make_recipe('registration.tests.utils.contact', _quantity=5)

        def select_function(cursor, i):
            cursor.execute("select count(*) from erc.contact")
            assert cursor.fetchone()[0] == 5

        def insert_function(cursor, i):
            sql, params = TestContactRls._create_insert_statement(contacts[0].operator.id)
            cursor.execute(sql, params)
            assert cursor.rowcount == 1

        test_policies_for_cas_roles(Contact, select_function=select_function, insert_function=insert_function)
