from django.test import TestCase
from common.tests.utils.helpers import BaseTestCase
from registration.models import Address, BusinessRole
from model_bakery import baker
from django.db import ProgrammingError, transaction
from registration.models.contact import Contact
from rls.tests.helpers import test_policies_for_cas_roles, test_policies_for_industry_user


class TestAddressModel(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        cls.test_object = baker.make(Address)
        cls.field_data = [
            ("id", "ID", None, None),
            ("street_address", "street address", 1000, None),
            ("municipality", "municipality", 1000, None),
            ("province", "province", 2, None),
            ("postal_code", "postal code", 7, None),
            ("contacts", "contact", None, None),
            ("operators_physical", "operator", None, None),
            ("operators_mailing", "operator", None, None),
            ("multiple_operators", "multiple operator", None, None),
            ("parent_operators_physical", "parent operator", None, None),
            ("parent_operators_mailing", "parent operator", None, None),
            ("facility_address", "facility", None, None),
        ]


class AddressTriggerTests(TestCase):
    def setUp(self):
        self.address = baker.make_recipe("registration.tests.utils.address")
        self.operation_representative_contact = baker.make_recipe(
            "registration.tests.utils.contact",
            business_role=BusinessRole.objects.get(role_name="Operation Representative"),
            address=self.address,
        )
        self.senior_officer_contact = baker.make_recipe(
            "registration.tests.utils.contact",
            business_role=BusinessRole.objects.get(role_name="Senior Officer"),
            address=self.address,
        )

    def test_prevent_field_null_for_operation_representative(self):
        """Test that setting a field to NULL fails when linked to Operation Representative."""
        with transaction.atomic():
            with self.assertRaises(ProgrammingError) as cm:
                self.address.street_address = None
                self.address.save()
            self.assertIn(
                "Cannot set address fields to empty or NULL when associated with an Operation Representative",
                str(cm.exception),
            )

        # Verify the field wasn’t changed
        self.address.refresh_from_db()
        self.assertIsNotNone(self.address.street_address)

    def test_prevent_field_empty_for_operation_representative(self):
        """Test that setting a field to empty string fails when linked to Operation Representative."""
        with transaction.atomic():
            with self.assertRaises(ProgrammingError) as cm:
                self.address.municipality = ''
                self.address.save()
            self.assertIn(
                "Cannot set address fields to empty or NULL when associated with an Operation Representative",
                str(cm.exception),
            )

        # Verify the field wasn’t changed
        self.address.refresh_from_db()
        self.assertNotEqual(self.address.municipality, "")

    def test_allow_field_update_to_non_empty_for_operation_representative(self):
        """Test that updating a field to a non-empty value succeeds."""
        self.address.street_address = "456 New St"
        self.address.save()

        # Verify the field was updated
        self.address.refresh_from_db()
        self.assertEqual(self.address.street_address, "456 New St")

    def test_allow_field_null_when_no_operation_representative(self):
        """Test that setting a field to NULL succeeds when no Operation Representative is linked."""
        # Remove the Operation Representative contact
        self.operation_representative_contact.delete()

        self.address.street_address = None
        self.address.save()

        # Verify the field is now NULL
        self.address.refresh_from_db()
        self.assertIsNone(self.address.street_address)

    def test_no_trigger_on_unchanged_fields(self):
        """Test that updating a non-triggering field doesn’t raise an exception."""
        fields_before_update = [self.address.street_address, self.address.municipality]
        # Here we just save without changes to test trigger doesn’t fire unnecessarily
        self.address.save()  # No changes

        # Verify fields unchanged
        self.address.refresh_from_db()
        self.assertEqual(fields_before_update, [self.address.street_address, self.address.municipality])


# RLS tests
class TestAddressRls(BaseTestCase):
    def test_address_rls_industry_user_success(self):
        approved_user_operator = baker.make_recipe('registration.tests.utils.approved_user_operator')
        contact_address = baker.make(Address)
        contact = baker.make(Contact, operator=approved_user_operator.operator, address=contact_address)
        random_address = baker.make(Address)
        random_contact = baker.make(Contact, address=random_address)

        def select_function(cursor):
            cursor.execute("select count(*) from erc.address")
            assert (
                cursor.fetchone()[0] == 2
            )  # Industry user should see the addresses associated with their operator and contact, but not the random contact's

        def insert_function(cursor):
            # address doesn't have an operator_id; it's connected to operator via contact or fk, so this test case is covered in the contact and operator tests
            pass

        def update_function(cursor):
            cursor.execute(
                """
                UPDATE "erc"."address"
                SET street_address = %s
                WHERE id = %s
            """,
                ('Updated', contact_address.id),
            )
            assert cursor.rowcount == 1

        def delete_function(cursor):
            breakpoint()
            cursor.execute(
                """
                delete from "erc"."address"

            """
            )
            breakpoint()
            assert (
                cursor.rowcount == 1
            )  # User should be able to delete their own address brianna and the operator address??

        test_policies_for_industry_user(
            Address, approved_user_operator.user, select_function, insert_function, update_function, delete_function
        )

    def test_address_rls_industry_user_fail(self):
        approved_user_operator = baker.make_recipe(
            'registration.tests.utils.approved_user_operator'
        )  # This creates an address record
        random_address = baker.make_recipe('registration.tests.utils.address')
        random_contact = baker.make_recipe(
            'registration.tests.utils.contact',
            operator=baker.make_recipe('registration.tests.utils.operator'),
            address=random_address,
        )

        def select_function(cursor):
            cursor.execute("select count(*) from erc.address where id = %s", [random_address.id])
            assert cursor.fetchone()[0] == 0  # User should not be able to see another operator's address

        def insert_function(cursor):
            # address doesn't have an operator_id; it's connected to operator via contact, so this test case is covered in the contact tests
            pass

        def update_function(cursor):

            cursor.execute(
                """
                            UPDATE "erc"."address"
                            SET street_address = %s
                            WHERE id = %s
                        """,
                ('Updated first name', random_address.id),
            )
            assert cursor.rowcount == 0  # User should not be able to update another operator's address

        def delete_function(cursor):
            cursor.execute(
                """
                delete from "erc"."address"

                WHERE id = %s
            """,
                (random_address.id,),
            )
            assert cursor.rowcount == 0

        test_policies_for_industry_user(
            Address, approved_user_operator.user, select_function, insert_function, update_function, delete_function
        )

    def test_address_rls_cas_users(self):
        for i in range(5):
            address = baker.make(Address)
            baker.make(Contact, address=address, _quantity=5)

        def select_function(cursor, i):
            cursor.execute("select count(*) from erc.address")
            assert cursor.fetchone()[0] == 5

        test_policies_for_cas_roles(Address, select_function=select_function)
