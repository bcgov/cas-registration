from django.test import TestCase

from .models import Document, Operation, Operator, User, NaicsCode, Contact, UserOperator


class UserModelTest(TestCase):
    @classmethod
    def setUpTestData(cls):
        # Set up minimum required non-modified objects used by all test methods
        testUser = User.objects.create(
            first_name="fname-test",
            last_name="lname-test",
            mailing_address="12 34 Street, Test",
            email="test@example.com",
            user_guid="00000000-0000-0000-0000-000000000000",
            business_guid="11111111-1111-1111-1111-111111111111",
            position_title="test",
        )

        testUser.documents.set(
            [
                Document.objects.create(file="test1.tst", document_type="test", description="test"),
                Document.objects.create(file="test2.tst", document_type="test", description="test"),
            ]
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

    def test_user_has_multiple_documents(self):
        testUser = User.objects.get(user_guid="00000000-0000-0000-0000-000000000000")
        self.assertEqual(testUser.documents.count(), 2)


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
    fixtures = ["operator.json", "user.json"]

    @classmethod
    def setUpTestData(cls):
        testOperator = Operator.objects.get(id=1)

        testOperator.documents.set(
            [
                Document.objects.create(file="test1.tst", document_type="test", description="test"),
                Document.objects.create(file="test2.tst", document_type="test", description="test"),
            ]
        )

        testOperator.contacts.set(
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

    def test_operator_has_multiple_documents(self):
        testOperator = Operator.objects.get(id=1)
        self.assertEqual(testOperator.documents.count(), 2)

    def test_operator_has_multiple_contacts(self):
        testOperator = Operator.objects.get(id=1)
        self.assertEqual(testOperator.contacts.count(), 2)

    def test_operator_has_multiple_user_operators(self):
        testOperator = Operator.objects.get(id=1)
        self.assertEqual(testOperator.operators.count(), 2)


class UserOperatorModelTest(TestCase):
    fixtures = ["user.json", "operator.json"]

    @classmethod
    def setUpTestData(cls):
        proof_doc = Document.objects.create(file="test.tst", document_type="test", description="test")
        signed_doc = Document.objects.create(file="test.tst", document_type="test", description="test")

        # Set up non-modified objects used by all test methods
        cls.testUserOperator = UserOperator.objects.create(
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

    def test_users_label(self):
        testUserOperator = self.testUserOperator
        field_label = testUserOperator._meta.get_field("users").verbose_name
        self.assertEqual(field_label, "users")

    def test_operators_label(self):
        testUserOperator = self.testUserOperator
        field_label = testUserOperator._meta.get_field("operators").verbose_name
        self.assertEqual(field_label, "operators")

    def test_role_label(self):
        testUserOperator = self.testUserOperator
        field_label = testUserOperator._meta.get_field("role").verbose_name
        self.assertEqual(field_label, "role")

    def test_role_max_length(self):
        testUserOperator = self.testUserOperator
        max_length = testUserOperator._meta.get_field("role").max_length
        self.assertEqual(max_length, 1000)

    def test_status_label(self):
        testUserOperator = self.testUserOperator
        field_label = testUserOperator._meta.get_field("status").verbose_name
        self.assertEqual(field_label, "status")

    def test_status_max_length(self):
        testUserOperator = self.testUserOperator
        max_length = testUserOperator._meta.get_field("status").max_length
        self.assertEqual(max_length, 1000)

    def test_user_is_aso_label(self):
        testUserOperator = self.testUserOperator
        field_label = testUserOperator._meta.get_field("user_is_aso").verbose_name
        self.assertEqual(field_label, "user is aso")

    def test_aso_is_owner_or_operator_label(self):
        testUserOperator = self.testUserOperator
        field_label = testUserOperator._meta.get_field("aso_is_owner_or_operator").verbose_name
        self.assertEqual(field_label, "aso is owner or operator")

    def test_user_is_third_party_label(self):
        testUserOperator = self.testUserOperator
        field_label = testUserOperator._meta.get_field("user_is_third_party").verbose_name
        self.assertEqual(field_label, "user is third party")

    def test_proof_of_authority_label(self):
        testUserOperator = self.testUserOperator
        field_label = testUserOperator._meta.get_field("proof_of_authority").verbose_name
        self.assertEqual(field_label, "proof of authority")

    def test_signed_statuatory_declaration_label(self):
        testUserOperator = self.testUserOperator
        field_label = testUserOperator._meta.get_field("signed_statuatory_declaration").verbose_name
        self.assertEqual(field_label, "signed statuatory declaration")


class OperationModelTest(TestCase):
    fixtures = ["operator.json", "naicsCode.json"]

    @classmethod
    def setUpTestData(cls):
        testOperation = Operation.objects.create(
            operator_id=Operator.objects.get(id=1),
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
        testOperation.contacts.set(
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

        testOperation.documents.set(
            [
                Document.objects.create(file="test1.tst", document_type="test", description="test"),
                Document.objects.create(file="test2.tst", document_type="test", description="test"),
            ]
        )

    def test_operator_id_label(self):
        testOperation = Operation.objects.get(id=1)
        field_label = testOperation._meta.get_field("operator_id").verbose_name
        self.assertEqual(field_label, "operator id")

    def test_name_label(self):
        testOperation = Operation.objects.get(id=1)
        field_label = testOperation._meta.get_field("name").verbose_name
        self.assertEqual(field_label, "name")

    def test_name_max_length(self):
        testOperation = Operation.objects.get(id=1)
        max_length = testOperation._meta.get_field("name").max_length
        self.assertEqual(max_length, 1000)

    def test_operation_type_label(self):
        testOperation = Operation.objects.get(id=1)
        field_label = testOperation._meta.get_field("operation_type").verbose_name
        self.assertEqual(field_label, "operation type")

    def test_operation_type_max_length(self):
        testOperation = Operation.objects.get(id=1)
        max_length = testOperation._meta.get_field("operation_type").max_length
        self.assertEqual(max_length, 1000)

    def test_eligible_commercial_product_name_label(self):
        testOperation = Operation.objects.get(id=1)
        field_label = testOperation._meta.get_field("eligible_commercial_product_name").verbose_name
        self.assertEqual(field_label, "eligible commercial product name")

    def test_eligible_commercial_product_name_max_length(self):
        testOperation = Operation.objects.get(id=1)
        max_length = testOperation._meta.get_field("eligible_commercial_product_name").max_length
        self.assertEqual(max_length, 1000)

    def test_permit_id_label(self):
        testOperation = Operation.objects.get(id=1)
        field_label = testOperation._meta.get_field("permit_id").verbose_name
        self.assertEqual(field_label, "permit id")

    def test_permit_id_max_length(self):
        testOperation = Operation.objects.get(id=1)
        max_length = testOperation._meta.get_field("permit_id").max_length
        self.assertEqual(max_length, 1000)

    def test_npr_id_label(self):
        testOperation = Operation.objects.get(id=1)
        field_label = testOperation._meta.get_field("npr_id").verbose_name
        self.assertEqual(field_label, "npr id")

    def test_npr_id_max_length(self):
        testOperation = Operation.objects.get(id=1)
        max_length = testOperation._meta.get_field("npr_id").max_length
        self.assertEqual(max_length, 1000)

    def test_ghfrp_id_label(self):
        testOperation = Operation.objects.get(id=1)
        field_label = testOperation._meta.get_field("ghfrp_id").verbose_name
        self.assertEqual(field_label, "ghfrp id")

    def test_ghfrp_id_max_length(self):
        testOperation = Operation.objects.get(id=1)
        max_length = testOperation._meta.get_field("ghfrp_id").max_length
        self.assertEqual(max_length, 1000)

    def test_bcghrp_id_label(self):
        testOperation = Operation.objects.get(id=1)
        field_label = testOperation._meta.get_field("bcghrp_id").verbose_name
        self.assertEqual(field_label, "bcghrp id")

    def test_bcghrp_id_max_length(self):
        testOperation = Operation.objects.get(id=1)
        max_length = testOperation._meta.get_field("bcghrp_id").max_length
        self.assertEqual(max_length, 1000)

    def test_petrinex_id_label(self):
        testOperation = Operation.objects.get(id=1)
        field_label = testOperation._meta.get_field("petrinex_id").verbose_name
        self.assertEqual(field_label, "petrinex id")

    def test_petrinex_id_max_length(self):
        testOperation = Operation.objects.get(id=1)
        max_length = testOperation._meta.get_field("petrinex_id").max_length
        self.assertEqual(max_length, 1000)

    def test_latitude_label(self):
        testOperation = Operation.objects.get(id=1)
        field_label = testOperation._meta.get_field("latitude").verbose_name
        self.assertEqual(field_label, "latitude")

    def test_longitude_label(self):
        testOperation = Operation.objects.get(id=1)
        field_label = testOperation._meta.get_field("longitude").verbose_name
        self.assertEqual(field_label, "longitude")

    def test_legal_land_description_label(self):
        testOperation = Operation.objects.get(id=1)
        field_label = testOperation._meta.get_field("legal_land_description").verbose_name
        self.assertEqual(field_label, "legal land description")

    def test_legal_land_description_max_length(self):
        testOperation = Operation.objects.get(id=1)
        max_length = testOperation._meta.get_field("legal_land_description").max_length
        self.assertEqual(max_length, 1000)

    def test_nearest_municipality_label(self):
        testOperation = Operation.objects.get(id=1)
        field_label = testOperation._meta.get_field("nearest_municipality").verbose_name
        self.assertEqual(field_label, "nearest municipality")

    def test_nearest_municipality_max_length(self):
        testOperation = Operation.objects.get(id=1)
        max_length = testOperation._meta.get_field("nearest_municipality").max_length
        self.assertEqual(max_length, 1000)

    def test_operator_percent_of_ownership_label(self):
        testOperation = Operation.objects.get(id=1)
        field_label = testOperation._meta.get_field("operator_percent_of_ownership").verbose_name
        self.assertEqual(field_label, "operator percent of ownership")

    def test_registered_for_obps_label(self):
        testOperation = Operation.objects.get(id=1)
        field_label = testOperation._meta.get_field("registered_for_obps").verbose_name
        self.assertEqual(field_label, "registered for obps")

    def test_verified_at_label(self):
        testOperation = Operation.objects.get(id=1)
        field_label = testOperation._meta.get_field("verified_at").verbose_name
        self.assertEqual(field_label, "verified at")

    def test_verified_by_label(self):
        testOperation = Operation.objects.get(id=1)
        field_label = testOperation._meta.get_field("verified_by").verbose_name
        self.assertEqual(field_label, "verified by")

    def test_estimated_emissions_label(self):
        testOperation = Operation.objects.get(id=1)
        field_label = testOperation._meta.get_field("estimated_emissions").verbose_name
        self.assertEqual(field_label, "estimated emissions")

    def test_documents_label(self):
        testOperation = Operation.objects.get(id=1)
        field_label = testOperation._meta.get_field("documents").verbose_name
        self.assertEqual(field_label, "documents")

    def test_contacts_label(self):
        testOperation = Operation.objects.get(id=1)
        field_label = testOperation._meta.get_field("contacts").verbose_name
        self.assertEqual(field_label, "contacts")

    def test_operation_has_documents(self):
        testOperation = Operation.objects.get(id=1)
        self.assertEqual(testOperation.documents.count(), 2)

    def test_operation_has_contacts(self):
        testOperation = Operation.objects.get(id=1)
        self.assertEqual(testOperation.contacts.count(), 2)
