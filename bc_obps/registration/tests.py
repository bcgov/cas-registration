from django.test import TestCase

from .models import Document, Operation, Operator, User, NaicsCode, Contact, UserOperator


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
            mailing_address="12 34 Street, Test",
            email="test@example.com",
            user_guid="00000000-0000-0000-0000-000000000000",
            business_guid="11111111-1111-1111-1111-111111111111",
            position_title="test",
        )

        cls.test_user.documents.set(
            [
                Document.objects.create(file="test1.tst", document_type="test", description="test"),
                Document.objects.create(file="test2.tst", document_type="test", description="test"),
            ]
        )

    def test_field_labels_and_max_lengths(self):
        # (field_name, expected_label, expected_max_length, expected_relations_count)
        field_data = [
            ("first_name", "first name", 1000, None),
            ("last_name", "last name", 1000, None),
            ("mailing_address", "mailing address", 1000, None),
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


class DocumentModelTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        cls.test_document = Document.objects.create(
            file="test.tst",
            document_type="test",
            description="test",
        )

    def test_field_labels_and_max_lengths(self):
        # (field_name, expected_label, expected_max_length)
        field_data = [
            ("file", "file", None),
            ("document_type", "document type", 1000),
            ("description", "description", 1000),
        ]

        for field_name, expected_label, expected_max_length in field_data:
            with self.subTest(field_name=field_name):
                if expected_label:
                    self.assertFieldLabel(self.test_document, field_name, expected_label)
                if expected_max_length is not None:
                    self.assertFieldMaxLength(self.test_document, field_name, expected_max_length)


class NAICSCodeModelTest(BaseTestCase):
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


class ContactModelTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        cls.test_contact = Contact.objects.create(
            first_name="fname-test",
            last_name="lname-test",
            mailing_address="12 34 Street, Test",
            email="test@example.com",
            phone_number="12345678900",
            is_operational_representative=False,
        )

    def test_field_labels_and_max_lengths(self):
        # (field_name, expected_label, expected_max_length)
        field_data = [
            ("first_name", "first name", 1000),
            ("last_name", "last name", 1000),
            ("mailing_address", "mailing address", 1000),
            ("email", "email", 254),
            ("phone_number", "phone number", None),
            ("is_operational_representative", "is operational representative", None),
            ("verified_at", "verified at", None),
            ("verified_by", "verified by", None),
        ]

        for field_name, expected_label, expected_max_length in field_data:
            with self.subTest(field_name=field_name):
                if expected_label:
                    self.assertFieldLabel(self.test_contact, field_name, expected_label)
                if expected_max_length is not None:
                    self.assertFieldMaxLength(self.test_contact, field_name, expected_max_length)


class OperatorModelTest(BaseTestCase):
    fixtures = ["operator.json", "user.json"]

    @classmethod
    def setUpTestData(cls):
        cls.test_operator = Operator.objects.get(id=1)

        cls.test_operator.documents.set(
            [
                Document.objects.create(file="test1.tst", document_type="test", description="test"),
                Document.objects.create(file="test2.tst", document_type="test", description="test"),
            ]
        )

        cls.test_operator.contacts.set(
            [
                Contact.objects.create(
                    first_name="fname-test",
                    last_name="lname-test",
                    mailing_address="12 34 Street, Test",
                    email=f"test1@example.com",
                    phone_number="12345678900",
                    is_operational_representative=False,
                ),
                Contact.objects.create(
                    first_name="fname-test",
                    last_name="lname-test",
                    mailing_address="12 34 Street, Test",
                    email=f"test2@example.com",
                    phone_number="12345678900",
                    is_operational_representative=False,
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
                proof_of_authority=Document.objects.create(file="test.tst", document_type="test", description="test"),
                signed_statuatory_declaration=Document.objects.create(
                    file="test.tst", document_type="test", description="test"
                ),
            )

    def test_field_labels_and_max_lengths_and_multiple_relations(self):
        # (field_name, expected_label, expected_max_length, expected_relations_count)
        field_data = [
            ("legal_name", "legal name", 1000, None),
            ("trade_name", "trade name", 1000, None),
            ("cra_business_number", "cra business number", 1000, None),
            ("bc_corporate_registry_number", "bc corporate registry number", 1000, None),
            ("business_structure", "business structure", 1000, None),
            ("mailing_address", "mailing address", 1000, None),
            ("bceid", "bceid", 1000, None),
            ("parent_operator", "parent operator", None, None),
            ("relationship_with_parent_operator", "relationship with parent operator", 1000, None),
            ("compliance_obligee", "compliance obligee", None, None),
            ("date_aso_became_responsible_for_operator", "date aso became responsible for operator", None, None),
            ("documents", "documents", None, 2),
            ("contacts", "contacts", None, 2),
            ("operators", "operators", None, 2),
        ]

        for field_name, expected_label, expected_max_length, expected_relations_count in field_data:
            with self.subTest(field_name=field_name):
                if expected_label:
                    self.assertFieldLabel(self.test_operator, field_name, expected_label)
                if expected_max_length is not None:
                    self.assertFieldMaxLength(self.test_operator, field_name, expected_max_length)
                if expected_relations_count is not None:
                    self.assertHasMultipleRelationsInField(self.test_operator, field_name, expected_relations_count)


class UserOperatorModelTest(BaseTestCase):
    fixtures = ["user.json", "operator.json"]

    @classmethod
    def setUpTestData(cls):
        proof_doc = Document.objects.create(file="test.tst", document_type="test", description="test")
        signed_doc = Document.objects.create(file="test.tst", document_type="test", description="test")

        cls.test_user_operator = UserOperator.objects.create(
            users=User.objects.get(user_guid="3fa85f64-5717-4562-b3fc-2c963f66afa6"),
            operators=Operator.objects.get(id=1),
            role=UserOperator.Roles.ADMIN,
            status=UserOperator.Statuses.PENDING,
            user_is_aso=True,
            aso_is_owner_or_operator=True,
            user_is_third_party=True,
            proof_of_authority=proof_doc,
            signed_statuatory_declaration=signed_doc,
        )

    def test_field_labels_and_max_lengths(self):
        # (field_name, expected_label, expected_max_length)
        field_data = [
            ("users", "users", None),
            ("operators", "operators", None),
            ("role", "role", 1000),
            ("status", "status", 1000),
            ("user_is_aso", "user is aso", None),
            ("aso_is_owner_or_operator", "aso is owner or operator", None),
            ("user_is_third_party", "user is third party", None),
            ("proof_of_authority", "proof of authority", None),
            ("signed_statuatory_declaration", "signed statuatory declaration", None),
        ]

        for field_name, expected_label, expected_max_length in field_data:
            with self.subTest(field_name=field_name):
                if expected_label:
                    self.assertFieldLabel(self.test_user_operator, field_name, expected_label)
                if expected_max_length is not None:
                    self.assertFieldMaxLength(self.test_user_operator, field_name, expected_max_length)


class OperationModelTest(BaseTestCase):
    fixtures = ["operator.json", "naicsCode.json"]

    @classmethod
    def setUpTestData(cls):
        cls.test_operation = Operation.objects.create(
            operator=Operator.objects.get(id=1),
            name="test-name",
            operation_type="test",
            naics_code=NaicsCode.objects.get(id=1),
            eligible_commercial_product_name="test",
            permit_id="test",
            latitude=0.1,
            longitude=0.1,
            legal_land_description="test",
            nearest_municipality="test",
            operator_percent_of_ownership=0.1,
            registered_for_obps=False,
            estimated_emissions=0.1,
        )

        cls.test_operation.contacts.set(
            [
                Contact.objects.create(
                    first_name="fname-test",
                    last_name="lname-test",
                    mailing_address="12 34 Street, Test",
                    email=f"test1@example.com",
                    phone_number="12345678900",
                    is_operational_representative=False,
                ),
                Contact.objects.create(
                    first_name="fname-test",
                    last_name="lname-test",
                    mailing_address="12 34 Street, Test",
                    email=f"test2@example.com",
                    phone_number="12345678900",
                    is_operational_representative=False,
                ),
            ]
        )

        cls.test_operation.documents.set(
            [
                Document.objects.create(file="test1.tst", document_type="test", description="test"),
                Document.objects.create(file="test2.tst", document_type="test", description="test"),
            ]
        )

    def assertHasMultipleRelationsInField(self, field_name, expected_relations_count):
        field = self.test_operation.__getattribute__(field_name)
        self.assertEqual(field.count(), expected_relations_count)

    def test_field_labels_and_max_lengths_and_multiple_relations(self):
        # (field_name, expected_label, expected_max_length, expected_relations_count)
        field_data = [
            ("operator", "operator", None, None),
            ("name", "name", 1000, None),
            ("operation_type", "operation type", 1000, None),
            ("eligible_commercial_product_name", "eligible commercial product name", 1000, None),
            ("permit_id", "permit id", 1000, None),
            ("npr_id", "npr id", 1000, None),
            ("ghfrp_id", "ghfrp id", 1000, None),
            ("bcghrp_id", "bcghrp id", 1000, None),
            ("petrinex_id", "petrinex id", 1000, None),
            ("latitude", "latitude", None, None),
            ("longitude", "longitude", None, None),
            ("legal_land_description", "legal land description", 1000, None),
            ("nearest_municipality", "nearest municipality", 1000, None),
            ("operator_percent_of_ownership", "operator percent of ownership", None, None),
            ("registered_for_obps", "registered for obps", None, None),
            ("verified_at", "verified at", None, None),
            ("verified_by", "verified by", None, None),
            ("estimated_emissions", "estimated emissions", None, None),
            ("documents", "documents", None, 2),
            ("contacts", "contacts", None, 2),
        ]

        for field_name, expected_label, expected_max_length, expected_relations_count in field_data:
            with self.subTest(field_name=field_name):
                if expected_label:
                    self.assertFieldLabel(self.test_operation, field_name, expected_label)
                if expected_max_length is not None:
                    self.assertFieldMaxLength(self.test_operation, field_name, expected_max_length)
                if expected_relations_count is not None:
                    self.assertHasMultipleRelationsInField(field_name, expected_relations_count)
