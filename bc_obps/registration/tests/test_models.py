from django.db import IntegrityError
from django.test import TestCase
from django.utils import timezone

from registration.models import (
    BusinessRole,
    DocumentType,
    Document,
    NaicsCode,
    ReportingActivity,
    RegulatedProduct,
    User,
    Contact,
    Operator,
    UserOperator,
    ParentChildOperator,
    Operation,
    MultipleOperator,
    UserAndContactCommonInfo,
    AppRole,
)


OPERATOR_FIXTURE = ("mock/operator.json",)
USER_FIXTURE = ("mock/user.json",)
OPERATION_FIXTURE = ("mock/operation.json",)
NAICS_CODE_FIXTURE = ("real/naicsCode.json",)
CONTACT_FIXTURE = ("mock/contact.json",)
DOCUMENT_FIXTURE = ("mock/document.json",)
DOCUMENT_TYPE_FIXTURE = ("real/documentType.json",)
BUSINESS_ROLE_FIXTURE = ("real/businessRole.json",)
APP_ROLE_FIXTURE = ("real/appRole.json",)
BUSINESS_STRUCTURE_FIXTURE = ("real/businessStructure.json",)


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


class DocumentTypeModelTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        cls.test_document_type = DocumentType.objects.create(
            name="test",
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
    fixtures = [DOCUMENT_FIXTURE, DOCUMENT_TYPE_FIXTURE]

    @classmethod
    def setUpTestData(cls):
        cls.test_document = Document.objects.get(id=1)

    def test_field_labels_and_max_lengths(self):
        # (field_name, expected_label, expected_max_length)
        field_data = [
            ("file", "file", None),
            ("type", "type", None),
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
            naics_description="test",
        )

    def test_field_labels_and_max_lengths(self):
        # (field_name, expected_label, expected_max_length)
        field_data = [
            ("naics_code", "naics code", 1000),
            ("naics_description", "naics description", 1000),
        ]

        for field_name, expected_label, expected_max_length in field_data:
            with self.subTest(field_name=field_name):
                if expected_label:
                    self.assertFieldLabel(self.test_naics_code, field_name, expected_label)
                if expected_max_length is not None:
                    self.assertFieldMaxLength(self.test_naics_code, field_name, expected_max_length)


class RegulatedProductModelTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        cls.test_regulated_product = RegulatedProduct.objects.create(
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
                    self.assertFieldLabel(self.test_regulated_product, field_name, expected_label)
                if expected_max_length is not None:
                    self.assertFieldMaxLength(self.test_regulated_product, field_name, expected_max_length)


class ReportingActivityModelTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        cls.test_reporting_activity = ReportingActivity.objects.create(
            name="test activity",
        )

    def test_field_labels_and_max_lengths(self):
        # (field_name, expected_label, expected_max_length)
        field_data = [("name", "name", 1000), ("applicable_to", "applicable to", None)]

        for field_name, expected_label, expected_max_length in field_data:
            with self.subTest(field_name=field_name):
                if expected_label:
                    self.assertFieldLabel(self.test_reporting_activity, field_name, expected_label)
                if expected_max_length is not None:
                    self.assertFieldMaxLength(self.test_reporting_activity, field_name, expected_max_length)


class UserModelTest(BaseTestCase):
    fixtures = [
        USER_FIXTURE,
        DOCUMENT_FIXTURE,
        DOCUMENT_TYPE_FIXTURE,
        APP_ROLE_FIXTURE,
    ]

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
            ("app_role", "app role", None, None),
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
    fixtures = [CONTACT_FIXTURE, DOCUMENT_FIXTURE, DOCUMENT_TYPE_FIXTURE, BUSINESS_ROLE_FIXTURE]

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
            ("business_role", "business role", None, None),
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
            first_name="Sarah",
            last_name="Smith",
            position_title="Sales Associate",
            street_address="456 Elm St",
            municipality="Greenville",
            province="BC",
            postal_code="V7W 3R4",
            email="john.doe@example.com",
            phone_number="9876543210",
        )

        with self.assertRaises(IntegrityError):
            contact2.save()


class OperatorModelTest(BaseTestCase):
    fixtures = [
        OPERATOR_FIXTURE,
        USER_FIXTURE,
        CONTACT_FIXTURE,
        DOCUMENT_FIXTURE,
        DOCUMENT_TYPE_FIXTURE,
        BUSINESS_STRUCTURE_FIXTURE,
        APP_ROLE_FIXTURE,
        BUSINESS_ROLE_FIXTURE,
    ]

    @classmethod
    def setUpTestData(cls):
        cls.test_operator = Operator.objects.get(id=1)

        cls.test_operator.documents.set(
            [
                Document.objects.get(id=1),
                Document.objects.get(id=2),
            ]
        )

        cls.test_operator.contacts.set([Contact.objects.get(id=1), Contact.objects.get(id=2)])

        # Create multiple UserOperators connected with the test Operator
        for _ in range(2):
            UserOperator.objects.create(
                user=User.objects.get(user_guid="3fa85f64-5717-4562-b3fc-2c963f66afa6"),
                operator=Operator.objects.get(id=1),
                role=UserOperator.Roles.ADMIN,
                verified_at=timezone.now(),
                verified_by=User.objects.get(user_guid="00000000-0000-0000-0000-000000000001"),
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
            ("business_structure", "business structure", None, None),
            ("physical_street_address", "physical street address", 1000, None),
            ("physical_municipality", "physical municipality", 1000, None),
            ("physical_province", "physical province", 2, None),
            ("physical_postal_code", "physical postal code", 7, None),
            ("mailing_street_address", "mailing street address", 1000, None),
            ("mailing_municipality", "mailing municipality", 1000, None),
            ("mailing_province", "mailing province", 2, None),
            ("mailing_postal_code", "mailing postal code", 7, None),
            ("website", "website", 200, None),
            ("documents", "documents", None, 2),
            ("contacts", "contacts", None, 2),
            ("status", "status", 1000, None),
            ("verified_by", "verified by", None, None),
            ("verified_at", "verified at", None, None),
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
    fixtures = [OPERATOR_FIXTURE, BUSINESS_STRUCTURE_FIXTURE]

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
    fixtures = [OPERATOR_FIXTURE, USER_FIXTURE, BUSINESS_STRUCTURE_FIXTURE, APP_ROLE_FIXTURE]

    @classmethod
    def setUpTestData(cls):
        cls.test_user_operator = UserOperator.objects.create(
            user=User.objects.get(user_guid="3fa85f64-5717-4562-b3fc-2c963f66afa6"),
            operator=Operator.objects.get(id=1),
            role=UserOperator.Roles.ADMIN,
            status=UserOperator.Statuses.PENDING,
            verified_at=timezone.now(),
            verified_by=User.objects.get(user_guid="00000000-0000-0000-0000-000000000001"),
        )

    def test_field_labels_and_max_lengths(self):
        # (field_name, expected_label, expected_max_length)
        field_data = [
            ("user", "user", None),
            ("operator", "operator", None),
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
        NAICS_CODE_FIXTURE,
        USER_FIXTURE,
        BUSINESS_ROLE_FIXTURE,
        OPERATOR_FIXTURE,
        APP_ROLE_FIXTURE,
        BUSINESS_STRUCTURE_FIXTURE,
        CONTACT_FIXTURE,
        OPERATION_FIXTURE,
        DOCUMENT_FIXTURE,
        DOCUMENT_TYPE_FIXTURE,
    ]

    @classmethod
    def setUpTestData(cls):
        cls.test_operation = Operation.objects.all().first()
        cls.test_operation.documents.set(
            [
                Document.objects.get(id=1),
                Document.objects.get(id=2),
            ]
        )

        cls.test_operation.reporting_activities.set(
            [
                ReportingActivity.objects.create(name="test"),
                ReportingActivity.objects.create(name="test2"),
            ]
        )
        cls.test_operation.regulated_products.set(
            [
                RegulatedProduct.objects.create(name="test"),
                RegulatedProduct.objects.create(name="test2"),
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
            ("regulated_products", "regulated products", None, 2),
            ("reporting_activities", "reporting activities", None, 2),
            (
                "previous_year_attributable_emissions",
                "previous year attributable emissions",
                None,
                None,
            ),
            ("swrs_facility_id", "swrs facility id", None, None),
            ("bcghg_id", "bcghg id", None, None),
            ("opt_in", "opt in", None, None),
            ("verified_at", "verified at", None, None),
            ("verified_by", "verified by", None, None),
            ("application_lead", "application lead", None, None),
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
                    self.assertFieldLabel(self.test_operation, field_name, expected_label)
                if expected_max_length is not None:
                    self.assertFieldMaxLength(self.test_operation, field_name, expected_max_length)
                if expected_relations_count is not None:
                    self.assertHasMultipleRelationsInField(field_name, expected_relations_count)


class AppRoleModelTest(BaseTestCase):
    fixtures = [APP_ROLE_FIXTURE]

    @classmethod
    def setUpTestData(cls):
        cls.test_app_role = AppRole.objects.first()

    def test_field_labels_and_max_lengths(self):
        # (field_name, expected_label, expected_max_length, expected_relations_count)
        field_data = [("role_name", "role name", 100, None), ("role_description", "role description", 1000, None)]

        for (
            field_name,
            expected_label,
            expected_max_length,
            expected_relations_count,
        ) in field_data:
            with self.subTest(field_name=field_name):
                if expected_label:
                    self.assertFieldLabel(self.test_app_role, field_name, expected_label)
                if expected_max_length is not None:
                    self.assertFieldMaxLength(self.test_app_role, field_name, expected_max_length)
                if expected_relations_count is not None:
                    self.assertHasMultipleRelationsInField(self.test_app_role, field_name, expected_relations_count)

    def test_initial_data(self):
        expected_roles = sorted(['cas_admin', 'cas_analyst', 'cas_pending', 'industry_user'])
        existing_roles = sorted(list(AppRole.objects.values_list('role_name', flat=True)))

        self.assertEqual(len(existing_roles), len(expected_roles))
        self.assertEqual(existing_roles, expected_roles)


class BusinessRoleModelTest(BaseTestCase):
    fixtures = [BUSINESS_ROLE_FIXTURE]

    @classmethod
    def setUpTestData(cls):
        cls.test_business_role = BusinessRole.objects.first()

    def test_field_labels_and_max_lengths(self):
        # (field_name, expected_label, expected_max_length, expected_relations_count)
        field_data = [("role_name", "role name", 100, None), ("role_description", "role description", 1000, None)]

        for (
            field_name,
            expected_label,
            expected_max_length,
            expected_relations_count,
        ) in field_data:
            with self.subTest(field_name=field_name):
                if expected_label:
                    self.assertFieldLabel(self.test_business_role, field_name, expected_label)
                if expected_max_length is not None:
                    self.assertFieldMaxLength(self.test_business_role, field_name, expected_max_length)
                if expected_relations_count is not None:
                    self.assertHasMultipleRelationsInField(
                        self.test_business_role, field_name, expected_relations_count
                    )

    def test_initial_data(self):
        expected_roles = sorted(
            ['Senior Officer', 'Operation Representative', 'Authorized Signing Officer', 'Operation Registration Lead']
        )
        existing_roles = sorted(list(BusinessRole.objects.values_list('role_name', flat=True)))

        self.assertEqual(len(existing_roles), len(expected_roles))
        self.assertEqual(existing_roles, expected_roles)


class MultipleOperatorModelTest(BaseTestCase):
    fixtures = [
        USER_FIXTURE,
        OPERATOR_FIXTURE,
        OPERATION_FIXTURE,
        NAICS_CODE_FIXTURE,
        NAICS_CATEGORY_FIXTURE,
        CONTACT_FIXTURE,
        DOCUMENT_FIXTURE,
    ]

    @classmethod
    def setUpTestData(cls):
        cls.test_multiple_operator = MultipleOperator.objects.create(
            operation=Operation.objects.get(id=1),
            operator_number=1,
            legal_name="test",
            trade_name="test",
            cra_business_number=1,
            bc_corporate_registry_number=1,
            business_structure="test",
            website="test",
            physical_street_address="test",
            physical_municipality="test",
            physical_province="BC",
            physical_postal_code="test",
            mailing_address_same_as_physical=False,
            mailing_street_address="test",
            mailing_municipality="test",
            mailing_province="BC",
            mailing_postal_code="test",
        )

    def test_field_labels_and_max_lengths(self):
        # (field_name, expected_label, expected_max_length, expected_relations_count)
        field_data = [
            ("operation", "operation", None, None),
            ("legal_name", "legal name", 1000, None),
            ("trade_name", "trade name", 1000, None),
            ("cra_business_number", "cra business number", None, None),
            (
                "bc_corporate_registry_number",
                "bc corporate registry number",
                None,
                None,
            ),
            ("business_structure", "business structure", None, None),
            ("physical_street_address", "physical street address", 1000, None),
            ("physical_municipality", "physical municipality", 1000, None),
            ("physical_province", "physical province", 2, None),
            ("physical_postal_code", "physical postal code", 7, None),
            ("mailing_address_same_as_physical", "mailing address same as physical", None, None),
            ("mailing_street_address", "mailing street address", 1000, None),
            ("mailing_municipality", "mailing municipality", 1000, None),
            ("mailing_province", "mailing province", 2, None),
            ("mailing_postal_code", "mailing postal code", 7, None),
            ("website", "website", 200, None),
        ]

        for (
            field_name,
            expected_label,
            expected_max_length,
            expected_relations_count,
        ) in field_data:
            with self.subTest(field_name=field_name):
                if expected_label:
                    self.assertFieldLabel(self.test_multiple_operator, field_name, expected_label)
                if expected_max_length is not None:
                    self.assertFieldMaxLength(self.test_multiple_operator, field_name, expected_max_length)
                if expected_relations_count is not None:
                    self.assertHasMultipleRelationsInField(
                        self.test_multiple_operator, field_name, expected_relations_count
                    )
