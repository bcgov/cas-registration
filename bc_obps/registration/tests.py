from django.test import TestCase

from .models import Document, Operator, User, NaicsCode, Contact


class UserModelTest(TestCase):
    @classmethod
    def setUpTestData(cls):
        # Set up minimum required non-modified objects used by all test methods
        User.objects.create(
            first_name="fname-test",
            last_name="lname-test",
            mailing_address="12 34 Street, Test",
            email="test@example.com",
            user_guid="00000000-0000-0000-0000-000000000000",
            business_guid="11111111-1111-1111-1111-111111111111",
            position_title="test",
        )

    def test_first_name_label(self):
        testUser = User.objects.get(user_guid="00000000-0000-0000-0000-000000000000")
        field_label = testUser._meta.get_field("first_name").verbose_name
        self.assertEqual(field_label, "first name")

    def test_first_name_max_length(self):
        testUser = User.objects.get(user_guid="00000000-0000-0000-0000-000000000000")
        max_length = testUser._meta.get_field("first_name").max_length
        self.assertEqual(max_length, 1000)

    def test_last_name_label(self):
        testUser = User.objects.get(user_guid="00000000-0000-0000-0000-000000000000")
        field_label = testUser._meta.get_field("last_name").verbose_name
        self.assertEqual(field_label, "last name")

    def test_last_name_max_length(self):
        testUser = User.objects.get(user_guid="00000000-0000-0000-0000-000000000000")
        max_length = testUser._meta.get_field("last_name").max_length
        self.assertEqual(max_length, 1000)

    def test_mailing_address_label(self):
        testUser = User.objects.get(user_guid="00000000-0000-0000-0000-000000000000")
        field_label = testUser._meta.get_field("mailing_address").verbose_name
        self.assertEqual(field_label, "mailing address")

    def test_mailing_address_max_length(self):
        testUser = User.objects.get(user_guid="00000000-0000-0000-0000-000000000000")
        max_length = testUser._meta.get_field("mailing_address").max_length
        self.assertEqual(max_length, 1000)

    def test_email_label(self):
        testUser = User.objects.get(user_guid="00000000-0000-0000-0000-000000000000")
        field_label = testUser._meta.get_field("email").verbose_name
        self.assertEqual(field_label, "email")

    def test_email_max_length(self):
        testUser = User.objects.get(user_guid="00000000-0000-0000-0000-000000000000")
        max_length = testUser._meta.get_field("email").max_length
        self.assertEqual(max_length, 254)

    def test_phone_number_label(self):
        testUser = User.objects.get(user_guid="00000000-0000-0000-0000-000000000000")
        field_label = testUser._meta.get_field("phone_number").verbose_name
        self.assertEqual(field_label, "phone number")

    def test_user_guid_label(self):
        testUser = User.objects.get(user_guid="00000000-0000-0000-0000-000000000000")
        field_label = testUser._meta.get_field("user_guid").verbose_name
        self.assertEqual(field_label, "user guid")

    def test_business_guid_label(self):
        testUser = User.objects.get(user_guid="00000000-0000-0000-0000-000000000000")
        field_label = testUser._meta.get_field("business_guid").verbose_name
        self.assertEqual(field_label, "business guid")

    def test_position_title_label(self):
        testUser = User.objects.get(user_guid="00000000-0000-0000-0000-000000000000")
        field_label = testUser._meta.get_field("position_title").verbose_name
        self.assertEqual(field_label, "position title")

    def test_position_title_max_length(self):
        testUser = User.objects.get(user_guid="00000000-0000-0000-0000-000000000000")
        max_length = testUser._meta.get_field("position_title").max_length
        self.assertEqual(max_length, 1000)

    def test_documents_label(self):
        testUser = User.objects.get(user_guid="00000000-0000-0000-0000-000000000000")
        field_label = testUser._meta.get_field("documents").verbose_name
        self.assertEqual(field_label, "documents")


class DocumentModelTest(TestCase):
    @classmethod
    def setUpTestData(cls):
        # Set up non-modified objects used by all test methods
        Document.objects.create(
            file="test.tst",
            document_type="test",
            description="test",
        )

    def test_file_label(self):
        testDocument = Document.objects.get(id=1)
        field_label = testDocument._meta.get_field("file").verbose_name
        self.assertEqual(field_label, "file")

    def test_document_type_label(self):
        testDocument = Document.objects.get(id=1)
        field_label = testDocument._meta.get_field("document_type").verbose_name
        self.assertEqual(field_label, "document type")

    def test_document_type_max_length(self):
        testDocument = Document.objects.get(id=1)
        max_length = testDocument._meta.get_field("document_type").max_length
        self.assertEqual(max_length, 1000)

    def test_description_label(self):
        testDocument = Document.objects.get(id=1)
        field_label = testDocument._meta.get_field("description").verbose_name
        self.assertEqual(field_label, "description")

    def test_description_max_length(self):
        testDocument = Document.objects.get(id=1)
        max_length = testDocument._meta.get_field("description").max_length
        self.assertEqual(max_length, 1000)


class NaicsCodeModelTest(TestCase):
    @classmethod
    def setUpTestData(cls):
        # Set up non-modified objects used by all test methods
        NaicsCode.objects.create(
            naics_code="1",
            ciip_sector="2",
            naics_description="test",
        )

    def test_naics_code_label(self):
        testNaicsCode = NaicsCode.objects.get(id=1)
        field_label = testNaicsCode._meta.get_field("naics_code").verbose_name
        self.assertEqual(field_label, "naics code")

    def test_naics_code_max_length(self):
        testNaicsCode = NaicsCode.objects.get(id=1)
        max_length = testNaicsCode._meta.get_field("naics_code").max_length
        self.assertEqual(max_length, 1000)

    def test_ciip_sector_label(self):
        testNaicsCode = NaicsCode.objects.get(id=1)
        field_label = testNaicsCode._meta.get_field("ciip_sector").verbose_name
        self.assertEqual(field_label, "ciip sector")

    def test_ciip_sector_max_length(self):
        testNaicsCode = NaicsCode.objects.get(id=1)
        max_length = testNaicsCode._meta.get_field("ciip_sector").max_length
        self.assertEqual(max_length, 1000)

    def test_naics_description_label(self):
        testNaicsCode = NaicsCode.objects.get(id=1)
        field_label = testNaicsCode._meta.get_field("naics_description").verbose_name
        self.assertEqual(field_label, "naics description")

    def test_naics_description_max_length(self):
        testNaicsCode = NaicsCode.objects.get(id=1)
        max_length = testNaicsCode._meta.get_field("naics_description").max_length
        self.assertEqual(max_length, 1000)


class ContactModelTest(TestCase):
    @classmethod
    def setUpTestData(cls):
        # Set up non-modified objects used by all test methods
        Contact.objects.create(
            first_name="fname-test",
            last_name="lname-test",
            mailing_address="12 34 Street, Test",
            email="test@example.com",
            phone_number="12345678900",
            is_operational_representative=False,
        )

    # TODO: DRY up code. Combine Contact & User model common fields
    def test_first_name_label(self):
        testContact = Contact.objects.get(id=1)
        field_label = testContact._meta.get_field("first_name").verbose_name
        self.assertEqual(field_label, "first name")

    def test_first_name_max_length(self):
        testContact = Contact.objects.get(id=1)
        max_length = testContact._meta.get_field("first_name").max_length
        self.assertEqual(max_length, 1000)

    def test_last_name_label(self):
        testContact = Contact.objects.get(id=1)
        field_label = testContact._meta.get_field("last_name").verbose_name
        self.assertEqual(field_label, "last name")

    def test_last_name_max_length(self):
        testContact = Contact.objects.get(id=1)
        max_length = testContact._meta.get_field("last_name").max_length
        self.assertEqual(max_length, 1000)

    def test_mailing_address_label(self):
        testContact = Contact.objects.get(id=1)
        field_label = testContact._meta.get_field("mailing_address").verbose_name
        self.assertEqual(field_label, "mailing address")

    def test_mailing_address_max_length(self):
        testContact = Contact.objects.get(id=1)
        max_length = testContact._meta.get_field("mailing_address").max_length
        self.assertEqual(max_length, 1000)

    def test_email_label(self):
        testContact = Contact.objects.get(id=1)
        field_label = testContact._meta.get_field("email").verbose_name
        self.assertEqual(field_label, "email")

    def test_email_max_length(self):
        testContact = Contact.objects.get(id=1)
        max_length = testContact._meta.get_field("email").max_length
        self.assertEqual(max_length, 254)

    def test_phone_number_label(self):
        testContact = Contact.objects.get(id=1)
        field_label = testContact._meta.get_field("phone_number").verbose_name
        self.assertEqual(field_label, "phone number")

    def test_is_operational_representative_label(self):
        testContact = Contact.objects.get(id=1)
        field_label = testContact._meta.get_field("is_operational_representative").verbose_name
        self.assertEqual(field_label, "is operational representative")

    def test_verified_at_label(self):
        testContact = Contact.objects.get(id=1)
        field_label = testContact._meta.get_field("verified_at").verbose_name
        self.assertEqual(field_label, "verified at")

    def test_verified_by_label(self):
        testContact = Contact.objects.get(id=1)
        field_label = testContact._meta.get_field("verified_by").verbose_name
        self.assertEqual(field_label, "verified by")


class OperatorModelTest(TestCase):
    fixtures = ["operator.json"]

    def test_legal_name_label(self):
        testOperator = Operator.objects.get(id=1)
        field_label = testOperator._meta.get_field("legal_name").verbose_name
        self.assertEqual(field_label, "legal name")

    def test_legal_name_max_length(self):
        testOperator = Operator.objects.get(id=1)
        max_length = testOperator._meta.get_field("legal_name").max_length
        self.assertEqual(max_length, 1000)

    def test_trade_name_label(self):
        testOperator = Operator.objects.get(id=1)
        field_label = testOperator._meta.get_field("trade_name").verbose_name
        self.assertEqual(field_label, "trade name")

    def test_trade_name_max_length(self):
        testOperator = Operator.objects.get(id=1)
        max_length = testOperator._meta.get_field("trade_name").max_length
        self.assertEqual(max_length, 1000)

    def test_cra_business_number_label(self):
        testOperator = Operator.objects.get(id=1)
        field_label = testOperator._meta.get_field("cra_business_number").verbose_name
        self.assertEqual(field_label, "cra business number")

    def test_cra_business_number_max_length(self):
        testOperator = Operator.objects.get(id=1)
        max_length = testOperator._meta.get_field("cra_business_number").max_length
        self.assertEqual(max_length, 1000)

    def test_bc_corporate_registry_number_label(self):
        testOperator = Operator.objects.get(id=1)
        field_label = testOperator._meta.get_field("bc_corporate_registry_number").verbose_name
        self.assertEqual(field_label, "bc corporate registry number")

    def test_bc_corporate_registry_number_max_length(self):
        testOperator = Operator.objects.get(id=1)
        max_length = testOperator._meta.get_field("bc_corporate_registry_number").max_length
        self.assertEqual(max_length, 1000)

    def test_business_structure_label(self):
        testOperator = Operator.objects.get(id=1)
        field_label = testOperator._meta.get_field("business_structure").verbose_name
        self.assertEqual(field_label, "business structure")

    def test_business_structure_max_length(self):
        testOperator = Operator.objects.get(id=1)
        max_length = testOperator._meta.get_field("business_structure").max_length
        self.assertEqual(max_length, 1000)

    def test_mailing_address_label(self):
        testOperator = Operator.objects.get(id=1)
        field_label = testOperator._meta.get_field("mailing_address").verbose_name
        self.assertEqual(field_label, "mailing address")

    def test_mailing_address_max_length(self):
        testOperator = Operator.objects.get(id=1)
        max_length = testOperator._meta.get_field("mailing_address").max_length
        self.assertEqual(max_length, 1000)

    def test_bceid_label(self):
        testOperator = Operator.objects.get(id=1)
        field_label = testOperator._meta.get_field("bceid").verbose_name
        self.assertEqual(field_label, "bceid")

    def test_bceid_max_length(self):
        testOperator = Operator.objects.get(id=1)
        max_length = testOperator._meta.get_field("bceid").max_length
        self.assertEqual(max_length, 1000)

    def test_parent_operator_label(self):
        testOperator = Operator.objects.get(id=1)
        field_label = testOperator._meta.get_field("parent_operator").verbose_name
        self.assertEqual(field_label, "parent operator")

    def test_relationship_with_parent_operator_label(self):
        testOperator = Operator.objects.get(id=1)
        field_label = testOperator._meta.get_field("relationship_with_parent_operator").verbose_name
        self.assertEqual(field_label, "relationship with parent operator")

    def test_relationship_with_parent_operator_max_length(self):
        testOperator = Operator.objects.get(id=1)
        max_length = testOperator._meta.get_field("relationship_with_parent_operator").max_length
        self.assertEqual(max_length, 1000)

    def test_compliance_obligee_label(self):
        testOperator = Operator.objects.get(id=1)
        field_label = testOperator._meta.get_field("compliance_obligee").verbose_name
        self.assertEqual(field_label, "compliance obligee")

    def test_date_aso_became_responsible_for_operator_label(self):
        testOperator = Operator.objects.get(id=1)
        field_label = testOperator._meta.get_field("date_aso_became_responsible_for_operator").verbose_name
        self.assertEqual(field_label, "date aso became responsible for operator")

    def test_documents_label(self):
        testOperator = Operator.objects.get(id=1)
        field_label = testOperator._meta.get_field("documents").verbose_name
        self.assertEqual(field_label, "documents")

    def test_contacts_label(self):
        testOperator = Operator.objects.get(id=1)
        field_label = testOperator._meta.get_field("contacts").verbose_name
        self.assertEqual(field_label, "contacts")

    def test_operators_label(self):
        testOperator = Operator.objects.get(id=1)
        field_label = testOperator._meta.get_field("operators").verbose_name
        self.assertEqual(field_label, "operators")
