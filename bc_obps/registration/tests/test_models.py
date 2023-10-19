from django.db import IntegrityError
from django.test import TestCase
import pytest

from registration.models import (
    DocumentType,
    Document,
    NaicsCode,
    NaicsCategory,
    PetrinexId,
    RegulatedProduct,
    User,
    Contact,
    Operator,
    UserOperator,
    ParentChildOperator,
    Operation,
    UserAndContactCommonInfo,
)

@pytest.mark.skip(reason="Will be updated in another PR")
class BaseTestCase(TestCase):
    def assertFieldLabel(self, instance, field_name, expected_label):
        field = instance._meta.get_field(field_name)
        self.assertEqual(field.verbose_name, expected_label)

    def assertFieldMaxLength(self, instance, field_name, expected_max_length):
        field = instance._meta.get_field(field_name)
        self.assertEqual(field.max_length, expected_max_length)

    def assertHasMultipleRelationsInField(self, instance, field_name, expected_relations_count):
        field = instance.__getattribute__(field_name)
        self.assertEqual(field.count(), expected_relations_count)

class UserModelTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        cls.test_user = User.objects.create(
            first_name="fname-test",
            last_name="lname-test",
            email="test@example.com",
            user_guid="00000000-0000-0000-0000-000000000000",
            business_guid="11111111-1111-1111-1111-111111111111",
            position_title="test",
        )

        cls.test_user.documents.set(
            [
                Document.objects.create(file="test1.tst", description="test"),
                Document.objects.create(file="test2.tst", description="test"),
            ]
        )

    def test_field_labels_and_max_lengths(self):
        # (field_name, expected_label, expected_max_length, expected_relations_count)
        field_data = [
            ("first_name", "first name", 1000, None),
            ("last_name", "last name", 1000, None),
            ("email", "email", 254, None),
            ("phone_number", "phone number", None, None),  # Replace None with the actual max length if available
            ("user_guid", "user guid", None, None),
            ("business_guid", "business guid", None, None),
            ("position_title", "position title", 1000, None),
            ("documents", "documents", None, 2),
        ]

        for field_name, expected_label, expected_max_length, expected_relations_count in field_data:
            with self.subTest(field_name=field_name):
                if expected_label:
                    self.assertFieldLabel(self.test_user, field_name, expected_label)
                if expected_max_length is not None:
                    self.assertFieldMaxLength(self.test_user, field_name, expected_max_length)
                if expected_relations_count is not None:
                    self.assertHasMultipleRelationsInField(self.test_user, field_name, expected_relations_count)

    def test_unique_user_guid_and_business_guid_constraint(self):
        # First user is `cls.test_user`, attempt to create another user with the same user_guid and business_guid
        user2 = User(
            first_name="fname-test2",
            last_name="lname-test2",
            email="test2@example.com",
            user_guid="00000000-0000-0000-0000-000000000000",
            business_guid="11111111-1111-1111-1111-111111111111",
            position_title="test2",
        )

        with self.assertRaises(IntegrityError):
            user2.save()

class DocumentModelTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        cls.test_document = Document.objects.create(
            file="test.tst",
            description="test",
        )

    def test_field_labels_and_max_lengths(self):
        # (field_name, expected_label, expected_max_length)
        field_data = [
            ("name", "name", 1000),
        ]

        for field_name, expected_label, expected_max_length in field_data:
            with self.subTest(field_name=field_name):
                if expected_label:
                    self.assertFieldLabel(self.test_document_type, field_name, expected_label)
                if expected_max_length is not None:
                    self.assertFieldMaxLength(self.test_document_type, field_name, expected_max_length)


class DocumentModelTest(BaseTestCase):
    fixtures = ["document.json"]

    @classmethod
    def setUpTestData(cls):
        cls.test_document = Document.objects.get(id=1)

    def test_field_labels_and_max_lengths(self):
        # (field_name, expected_label, expected_max_length)
        field_data = [
            ("file", "file", None),
            ("description", "description", 1000),
        ]

        for field_name, expected_label, expected_max_length in field_data:
            with self.subTest(field_name=field_name):
                if expected_label:
                    self.assertFieldLabel(self.test_document, field_name, expected_label)
                if expected_max_length is not None:
                    self.assertFieldMaxLength(self.test_document, field_name, expected_max_length)


class NaicsCodeModelTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        cls.test_naics_code = NaicsCode.objects.create(
            naics_code="1",
            ciip_sector="2",
            naics_description="test",
        )

    def test_field_labels_and_max_lengths(self):
        # (field_name, expected_label, expected_max_length)
        field_data = [
            ("naics_code", "naics code", 1000),
            ("ciip_sector", "ciip sector", 1000),
            ("naics_description", "naics description", 1000),
        ]

        for field_name, expected_label, expected_max_length in field_data:
            with self.subTest(field_name=field_name):
                if expected_label:
                    self.assertFieldLabel(self.test_naics_code, field_name, expected_label)
                if expected_max_length is not None:
                    self.assertFieldMaxLength(self.test_naics_code, field_name, expected_max_length)


class NaicsCategoryModelTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        cls.test_contact = Contact.objects.create(
            first_name="fname-test",
            last_name="lname-test",
            email="test@example.com",
            phone_number="12345678900",
        )

    def test_field_labels_and_max_lengths(self):
        # (field_name, expected_label, expected_max_length)
        field_data = [
            ("first_name", "first name", 1000),
            ("last_name", "last name", 1000),
            ("email", "email", 254),
            ("phone_number", "phone number", None),
        ]

        for field_name, expected_label, expected_max_length in field_data:
            with self.subTest(field_name=field_name):
                if expected_label:
                    self.assertFieldLabel(self.test_naics_category, field_name, expected_label)
                if expected_max_length is not None:
                    self.assertFieldMaxLength(self.test_naics_category, field_name, expected_max_length)


class PetrinexIdModelTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        cls.test_naics_category = PetrinexId.objects.create(
            id="12456",
        )

    def test_field_labels_and_max_lengths(self):
        # (field_name, expected_label, expected_max_length)
        field_data = [
            ("id", "id", None),
        ]

        for field_name, expected_label, expected_max_length in field_data:
            with self.subTest(field_name=field_name):
                if expected_label:
                    self.assertFieldLabel(self.test_naics_category, field_name, expected_label)
                if expected_max_length is not None:
                    self.assertFieldMaxLength(self.test_naics_category, field_name, expected_max_length)


class RegulatedProductModelTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        cls.test_naics_category = RegulatedProduct.objects.create(
            name="test product",
        )

    def test_field_labels_and_max_lengths(self):
        # (field_name, expected_label, expected_max_length)
        field_data = [
            ("name", "name", 1000),
        ]

        for field_name, expected_label, expected_max_length in field_data:
            with self.subTest(field_name=field_name):
                if expected_label:
                    self.assertFieldLabel(self.test_naics_category, field_name, expected_label)
                if expected_max_length is not None:
                    self.assertFieldMaxLength(self.test_naics_category, field_name, expected_max_length)


class UserModelTest(BaseTestCase):
    fixtures = ["user.json", "document.json"]

    @classmethod
    def setUpTestData(cls):
        cls.test_user = User.objects.get(user_guid="3fa85f64-5717-4562-b3fc-2c963f66afa6")

        cls.test_user.documents.set([Document.objects.get(id=1), Document.objects.get(id=2)])

    def test_field_labels_and_max_lengths(self):
        # (field_name, expected_label, expected_max_length, expected_relations_count)
        field_data = [
            ("first_name", "first name", 1000, None),
            ("last_name", "last name", 1000, None),
            ("position_title", "position title", 1000, None),
            ("street_address", "street address", 1000, None),
            ("municipality", "municipality", 1000, None),
            ("province", "province", 2, None),
            ("postal_code", "postal code", 7, None),
            ("email", "email", 254, None),
            (
                "phone_number",
                "phone number",
                None,
                None,
            ),  # Replace None with the actual max length if available
            ("user_guid", "user guid", None, None),
            ("business_guid", "business guid", None, None),
            ("documents", "documents", None, 2),
        ]

        for (
            field_name,
            expected_label,
            expected_max_length,
            expected_relations_count,
        ) in field_data:
            with self.subTest(field_name=field_name):
                if expected_label:
                    self.assertFieldLabel(self.test_user, field_name, expected_label)
                if expected_max_length is not None:
                    self.assertFieldMaxLength(self.test_user, field_name, expected_max_length)
                if expected_relations_count is not None:
                    self.assertHasMultipleRelationsInField(self.test_user, field_name, expected_relations_count)

    def test_unique_user_guid_and_business_guid_constraint(self):
        # First user is `cls.test_user` from the fixture, attempt to create another user with the same user_guid and business_guid
        user2 = User(
            first_name="fname-test2",
            last_name="lname-test2",
            position_title="Manager",
            street_address="456 Elm St",
            municipality="Newville",
            province="BC",
            postal_code="X1Y 2Z3",
            email="alicesmith@example.com",
            phone_number="9876543210",
            user_guid="3fa85f64-5717-4562-b3fc-2c963f66afa6",
            business_guid="11111111-1111-1111-1111-111111111111",
        )

        with self.assertRaises(IntegrityError):
            user2.save()


class ContactModelTest(BaseTestCase):
    fixtures = ["contact.json", "document.json"]

    @classmethod
    def setUpTestData(cls):
        cls.test_contact = Contact.objects.get(id=1)

        cls.test_contact.documents.set([Document.objects.get(id=1), Document.objects.get(id=2)])

    def test_field_labels_and_max_lengths(self):
        # (field_name, expected_label, expected_max_length, expected_relations_count)
        field_data = [
            ("first_name", "first name", 1000, None),
            ("last_name", "last name", 1000, None),
            ("position_title", "position title", 1000, None),
            ("street_address", "street address", 1000, None),
            ("municipality", "municipality", 1000, None),
            ("province", "province", 2, None),
            ("postal_code", "postal code", 7, None),
            ("email", "email", 254, None),
            (
                "phone_number",
                "phone number",
                None,
                None,
            ),  # Replace None with the actual max length if available
            ("role", "role", 1000, None),
        ]

        for (
            field_name,
            expected_label,
            expected_max_length,
            expected_relations_count,
        ) in field_data:
            with self.subTest(field_name=field_name):
                if expected_label:
                    self.assertFieldLabel(self.test_contact, field_name, expected_label)
                if expected_max_length is not None:
                    self.assertFieldMaxLength(self.test_contact, field_name, expected_max_length)
                if expected_relations_count is not None:
                    self.assertHasMultipleRelationsInField(self.test_contact, field_name, expected_relations_count)

    def test_unique_email_constraint(self):
        # First user is `cls.test_user` from the fixture, attempt to create a second contact with the same email address
        contact2 = Contact(
            first_name="fname-test2",
            last_name="lname-test2",
            email="test@example.com",
            phone_number="9876543210",
        )

        with self.assertRaises(IntegrityError):
            contact2.save()


class OperatorModelTest(BaseTestCase):
    fixtures = ["operator.json", "user.json", "document.json", "contact.json"]

    @classmethod
    def setUpTestData(cls):
        cls.test_operator = Operator.objects.get(id=1)

        cls.test_operator.documents.set(
            [
                Document.objects.create(file="test1.tst", description="test"),
                Document.objects.create(file="test2.tst", description="test"),
            ]
        )

        cls.test_operator.contacts.set(
            [
                Contact.objects.create(
                    first_name="fname-test",
                    last_name="lname-test",
                    email="test1@example.com",
                    phone_number="12345678900",
                ),
                Contact.objects.create(
                    first_name="fname-test",
                    last_name="lname-test",
                    email="test2@example.com",
                    phone_number="12345678900",
                ),
            ]
        )

        # Create multiple UserOperators connected with the test Operator
        for x in range(2):
            UserOperator.objects.create(
                users=User.objects.get(user_guid="3fa85f64-5717-4562-b3fc-2c963f66afa6"),
                operators=Operator.objects.get(id=1),
                role=UserOperator.Roles.ADMIN,
                status=UserOperator.Statuses.PENDING,
                user_is_aso=True,
                aso_is_owner_or_operator=True,
                user_is_third_party=True,
                proof_of_authority=Document.objects.create(file="test.tst", description="test"),
                signed_statuatory_declaration=Document.objects.create(
                    file="test.tst", description="test"
                ),
            )

    def test_field_labels_and_max_lengths_and_multiple_relations(self):
        # (field_name, expected_label, expected_max_length, expected_relations_count)
        field_data = [
            ("legal_name", "legal name", 1000, None),
            ("trade_name", "trade name", 1000, None),
            ("cra_business_number", "cra business number", None, None),
            (
                "bc_corporate_registry_number",
                "bc corporate registry number",
                None,
                None,
            ),
            ("duns_number", "duns number", None, None),
            ("business_structure", "business structure", 1000, None),
            ("bceid", "bceid", 1000, None),
            ("parent_operator", "parent operator", None, None),
            ("relationship_with_parent_operator", "relationship with parent operator", 1000, None),
            ("compliance_obligee", "compliance obligee", None, None),
            ("date_aso_became_responsible_for_operator", "date aso became responsible for operator", None, None),
            ("documents", "documents", None, 2),
            ("contacts", "contacts", None, 2),
        ]

        for (
            field_name,
            expected_label,
            expected_max_length,
            expected_relations_count,
        ) in field_data:
            with self.subTest(field_name=field_name):
                if expected_label:
                    self.assertFieldLabel(self.test_operator, field_name, expected_label)
                if expected_max_length is not None:
                    self.assertFieldMaxLength(self.test_operator, field_name, expected_max_length)
                if expected_relations_count is not None:
                    self.assertHasMultipleRelationsInField(self.test_operator, field_name, expected_relations_count)


class ParentChildOperatorModelTest(BaseTestCase):
    fixtures = ["operator.json"]

    @classmethod
    def setUpTestData(cls):
        cls.test_parent_child_operator = ParentChildOperator.objects.create(
            parent_operator=Operator.objects.get(id=1),
            child_operator=Operator.objects.get(id=2),
            percentage_owned_by_parent_company=55.6,
        )

    def test_field_labels_and_max_lengths(self):
        # (field_name, expected_label, expected_max_length)
        field_data = [
            ("parent_operator", "parent operator", None),
            ("child_operator", "child operator", None),
            (
                "percentage_owned_by_parent_company",
                "percentage owned by parent company",
                None,
            ),
        ]

        for field_name, expected_label, expected_max_length in field_data:
            with self.subTest(field_name=field_name):
                if expected_label:
                    self.assertFieldLabel(self.test_parent_child_operator, field_name, expected_label)
                if expected_max_length is not None:
                    self.assertFieldMaxLength(self.test_parent_child_operator, field_name, expected_max_length)


class UserOperatorModelTest(BaseTestCase):
    fixtures = ["user.json", "operator.json"]

    @classmethod
    def setUpTestData(cls):
        proof_doc = Document.objects.create(file="test.tst", description="test")
        signed_doc = Document.objects.create(file="test.tst", description="test")

        cls.test_user_operator = UserOperator.objects.create(
            users=User.objects.get(user_guid="3fa85f64-5717-4562-b3fc-2c963f66afa6"),
            operators=Operator.objects.get(id=1),
            role=UserOperator.Roles.ADMIN,
            status=UserOperator.Statuses.PENDING,
            verified_at="2013-11-05",
            verified_by=User.objects.get(user_guid="00000000-0000-0000-0000-000000000001"),
        )

    def test_field_labels_and_max_lengths(self):
        # (field_name, expected_label, expected_max_length)
        field_data = [
            ("users", "users", None),
            ("operators", "operators", None),
            ("role", "role", 1000),
            ("status", "status", 1000),
            ("verified_by", "verified by", None),
            ("verified_at", "verified at", None),
        ]

        for field_name, expected_label, expected_max_length in field_data:
            with self.subTest(field_name=field_name):
                if expected_label:
                    self.assertFieldLabel(self.test_user_operator, field_name, expected_label)
                if expected_max_length is not None:
                    self.assertFieldMaxLength(self.test_user_operator, field_name, expected_max_length)


class OperationModelTest(BaseTestCase):
    fixtures = [
        "user.json",
        "operator.json",
        "operation.json",
        "naicsCode.json",
        "naicsCategory.json",
        "contact.json",
        "document.json",
    ]

    @classmethod
    def setUpTestData(cls):
        cls.test_operation = Operation.objects.create(
            operator=Operator.objects.get(id=1),
            name="test-name",
            naics_code=NaicsCode.objects.get(id=1),
            type="test",
            naics_category_id=1,
            latitude=0.1,
            longitude=0.1,
            legal_land_description="test",
        )

        cls.test_operation.contacts.set(
            [
                Contact.objects.create(
                    first_name="fname-test",
                    last_name="lname-test",
                    email="test1@example.com",
                    phone_number="12345678900",
                ),
                Contact.objects.create(
                    first_name="fname-test",
                    last_name="lname-test",
                    email="test2@example.com",
                    phone_number="12345678900",
                ),
            ]
        )

        cls.test_operation.documents.set(
            [
                Document.objects.create(file="test1.tst", type_id=1, description="test"),
                Document.objects.create(file="test2.tst", type_id=1, description="test"),
            ]
        )

    def assertHasMultipleRelationsInField(self, field_name, expected_relations_count):
        field = self.test_operation.__getattribute__(field_name)
        self.assertEqual(field.count(), expected_relations_count)

    def test_field_labels_and_max_lengths_and_multiple_relations(self):
        # (field_name, expected_label, expected_max_length, expected_relations_count)
        field_data = [
            ("name", "name", 1000, None),
            ("type", "type", 1000, None),
            ("naics_code", "naics code", None, None),
            ("naics_category", "naics category", None, None),
            ("reporting_activities", "reporting activities", 1000, None),
            ("permit_issuing_agency", "permit issuing agency", 1000, None),
            ("permit_number", "permit number", 1000, None),
            (
                "previous_year_attributable_emissions",
                "previous year attributable emissions",
                None,
                None,
            ),
            ("swrs_facility_id", "swrs facility id", None, None),
            ("bcghg_id", "bcghg id", None, None),
            (
                "current_year_estimated_emissions",
                "current year estimated emissions",
                None,
                None,
            ),
            ("opt_in", "opt in", None, None),
            ("new_entrant", "new entrant", None, None),
            (
                "start_of_commercial_operation",
                "start of commercial operation",
                None,
                None,
            ),
            ("physical_street_address", "physical street address", 1000, None),
            ("physical_municipality", "physical municipality", 1000, None),
            ("physical_province", "physical province", 2, None),
            ("physical_postal_code", "physical postal code", 7, None),
            ("legal_land_description", "legal land description", 1000, None),
            ("latitude", "latitude", None, None),
            ("longitude", "longitude", None, None),
            ("legal_land_description", "legal land description", 1000, None),
            ("nearest_municipality", "nearest municipality", 1000, None),
            ("operator_percent_of_ownership", "operator percent of ownership", None, None),
            ("registered_for_obps", "registered for obps", None, None),
            ("estimated_emissions", "estimated emissions", None, None),
            ("documents", "documents", None, 2),
            ("contacts", "contacts", None, 2),
            ("petrinex_ids", "petrinex ids", None, 2),
            ("regulated_products", "regulated products", None, 2),
        ]

        for (
            field_name,
            expected_label,
            expected_max_length,
            expected_relations_count,
        ) in field_data:
            with self.subTest(field_name=field_name):
                if expected_label:
                    self.assertFieldLabel(self.test_operation, field_name, expected_label)
                if expected_max_length is not None:
                    self.assertFieldMaxLength(self.test_operation, field_name, expected_max_length)
                if expected_relations_count is not None:
                    self.assertHasMultipleRelationsInField(field_name, expected_relations_count)
