from typing import List, Tuple, Type
from django.db import IntegrityError, models
from django.forms import model_to_dict
from django.test import TestCase
from django.utils import timezone
from registration.models import (
    BusinessRole,
    BusinessStructure,
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
    AppRole,
)
import pytest
from model_bakery import baker


# below imports are needed to be used by usefixtures
from registration.tests.utils.bakers import (
    user_baker,
    naics_code_baker,
    document_baker,
    contact_baker,
    operator_baker,
    operation_baker,
    user_operator_baker,
    multiple_operator_baker,
)

pytestmark = pytest.mark.django_db


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


timestamp_common_fields = [
    ("created_at", "created at", None, None),
    ("created_by", "created by", None, None),
    ("updated_at", "updated at", None, None),
    ("updated_by", "updated by", None, None),
    ("archived_at", "archived at", None, None),
    ("archived_by", "archived by", None, None),
]


class BaseTestCase(TestCase):
    field_data = []  # Override this in the child class

    def assertFieldLabel(self, instance, field_name, expected_label):
        field = instance._meta.get_field(field_name)
        self.assertEqual(field.verbose_name, expected_label)

    def assertFieldMaxLength(self, instance, field_name, expected_max_length):
        field = instance._meta.get_field(field_name)
        self.assertEqual(field.max_length, expected_max_length)

    def assertHasMultipleRelationsInField(self, instance, field_name, expected_relations_count):
        field = instance.__getattribute__(field_name)
        self.assertEqual(field.count(), expected_relations_count)

    def test_field_labels_and_max_lengths(self):
        for (
            field_name,
            expected_label,
            expected_max_length,
            expected_relations_count,
        ) in self.field_data:
            with self.subTest(field_name=field_name):
                if expected_label:
                    self.assertFieldLabel(self.test_object, field_name, expected_label)
                if expected_max_length is not None:
                    self.assertFieldMaxLength(self.test_object, field_name, expected_max_length)
                if expected_relations_count is not None:
                    self.assertHasMultipleRelationsInField(self.test_object, field_name, expected_relations_count)


class DocumentTypeModelTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        cls.field_data = [
            ("name", "name", 1000, None),
        ]
        cls.test_object = DocumentType.objects.create(
            name="test",
        )


class DocumentModelTest(BaseTestCase):
    fixtures = [DOCUMENT_FIXTURE, DOCUMENT_TYPE_FIXTURE]

    @classmethod
    def setUpTestData(cls):
        cls.field_data = [
            *timestamp_common_fields,
            ("file", "file", None, None),
            ("type", "type", None, None),
            ("description", "description", 1000, None),
        ]
        cls.test_object = Document.objects.get(id=1)


class NaicsCodeModelTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        cls.test_object = NaicsCode.objects.create(
            naics_code="1",
            naics_description="test",
        )
        cls.field_data = [
            ("naics_code", "naics code", 1000, None),
            ("naics_description", "naics description", 1000, None),
        ]


class RegulatedProductModelTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        cls.field_data = [
            ("name", "name", 1000, None),
        ]
        cls.test_object = RegulatedProduct.objects.create(
            name="test product",
        )


class ReportingActivityModelTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        cls.field_data = [("name", "name", 1000, None), ("applicable_to", "applicable to", None, None)]
        cls.test_object = ReportingActivity.objects.create(
            name="test activity",
        )


class UserModelTest(BaseTestCase):
    fixtures = [
        USER_FIXTURE,
        DOCUMENT_FIXTURE,
        DOCUMENT_TYPE_FIXTURE,
        APP_ROLE_FIXTURE,
    ]

    @classmethod
    def setUpTestData(cls):
        cls.test_object = User.objects.get(user_guid="3fa85f64-5717-4562-b3fc-2c963f66afa6")
        cls.test_object.documents.set([Document.objects.get(id=1), Document.objects.get(id=2)])
        cls.field_data = [
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
    fixtures = [
        APP_ROLE_FIXTURE,
        USER_FIXTURE,
        CONTACT_FIXTURE,
        DOCUMENT_FIXTURE,
        DOCUMENT_TYPE_FIXTURE,
        BUSINESS_ROLE_FIXTURE,
    ]

    @classmethod
    def setUpTestData(cls):
        cls.test_object = Contact.objects.get(id=1)
        cls.test_object.documents.set([Document.objects.get(id=1), Document.objects.get(id=2)])
        cls.field_data = [
            *timestamp_common_fields,
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
            contact2.save(modifier=User.objects.first())


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
        cls.test_object = Operator.objects.get(id=1)
        cls.test_object.documents.set(
            [
                Document.objects.get(id=1),
                Document.objects.get(id=2),
            ]
        )

        cls.test_object.contacts.set([Contact.objects.get(id=1), Contact.objects.get(id=2)])
        # Create multiple UserOperators connected with the test Operator
        user_operators_user = User.objects.get(user_guid="3fa85f64-5717-4562-b3fc-2c963f66afa6")
        for _ in range(2):
            UserOperator.objects.create(
                user=user_operators_user,
                operator=Operator.objects.get(id=1),
                role=UserOperator.Roles.ADMIN,
                verified_at=timezone.now(),
                verified_by=User.objects.get(user_guid="00000000-0000-0000-0000-000000000001"),
                modifier=user_operators_user,
            )

        cls.field_data = [
            *timestamp_common_fields,
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


class ParentChildOperatorModelTest(BaseTestCase):
    fixtures = [OPERATOR_FIXTURE, BUSINESS_STRUCTURE_FIXTURE]

    @classmethod
    def setUpTestData(cls):
        cls.test_object = ParentChildOperator.objects.create(
            parent_operator=Operator.objects.get(id=1),
            child_operator=Operator.objects.get(id=2),
            percentage_owned_by_parent_company=55.6,
        )
        cls.field_data = [
            ("parent_operator", "parent operator", None, None),
            ("child_operator", "child operator", None, None),
            ("percentage_owned_by_parent_company", "percentage owned by parent company", None, None),
        ]


class UserOperatorModelTest(BaseTestCase):
    fixtures = [OPERATOR_FIXTURE, USER_FIXTURE, BUSINESS_STRUCTURE_FIXTURE, APP_ROLE_FIXTURE]

    @classmethod
    def setUpTestData(cls):
        user_operators_user = User.objects.get(user_guid="3fa85f64-5717-4562-b3fc-2c963f66afa6")
        cls.test_object = UserOperator.objects.create(
            user=user_operators_user,
            operator=Operator.objects.get(id=1),
            role=UserOperator.Roles.ADMIN,
            status=UserOperator.Statuses.PENDING,
            verified_at=timezone.now(),
            verified_by=User.objects.get(user_guid="00000000-0000-0000-0000-000000000001"),
            modifier=user_operators_user,
        )
        cls.field_data = [
            *timestamp_common_fields,
            ("user", "user", None, None),
            ("operator", "operator", None, None),
            ("role", "role", 1000, None),
            ("status", "status", 1000, None),
            ("verified_by", "verified by", None, None),
            ("verified_at", "verified at", None, None),
        ]


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
        cls.test_object = Operation.objects.first()
        cls.test_object.documents.set(
            [
                Document.objects.get(id=1),
                Document.objects.get(id=2),
            ]
        )

        cls.test_object.reporting_activities.set(
            [
                ReportingActivity.objects.create(name="test"),
                ReportingActivity.objects.create(name="test2"),
            ]
        )
        cls.test_object.regulated_products.set(
            [
                RegulatedProduct.objects.create(name="test"),
                RegulatedProduct.objects.create(name="test2"),
            ]
        )
        cls.field_data = [
            *timestamp_common_fields,
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


class AppRoleModelTest(BaseTestCase):
    fixtures = [APP_ROLE_FIXTURE]

    @classmethod
    def setUpTestData(cls):
        cls.test_object = AppRole.objects.first()
        cls.field_data = [("role_name", "role name", 100, None), ("role_description", "role description", 1000, None)]

    def test_initial_data(self):
        expected_roles = sorted(['cas_admin', 'cas_analyst', 'cas_pending', 'industry_user'])
        existing_roles = sorted(list(AppRole.objects.values_list('role_name', flat=True)))

        self.assertEqual(len(existing_roles), len(expected_roles))
        self.assertEqual(existing_roles, expected_roles)


class BusinessRoleModelTest(BaseTestCase):
    fixtures = [BUSINESS_ROLE_FIXTURE]

    @classmethod
    def setUpTestData(cls):
        cls.test_object = BusinessRole.objects.first()
        cls.field_data = [("role_name", "role name", 100, None), ("role_description", "role description", 1000, None)]

    def test_initial_data(self):
        expected_roles = sorted(
            ['Senior Officer', 'Operation Representative', 'Authorized Signing Officer', 'Operation Registration Lead']
        )
        existing_roles = sorted(list(BusinessRole.objects.values_list('role_name', flat=True)))

        self.assertEqual(len(existing_roles), len(expected_roles))
        self.assertEqual(existing_roles, expected_roles)


class MultipleOperatorModelTest(BaseTestCase):
    fixtures = [
        NAICS_CODE_FIXTURE,
        USER_FIXTURE,
        BUSINESS_ROLE_FIXTURE,
        OPERATOR_FIXTURE,
        APP_ROLE_FIXTURE,
        BUSINESS_STRUCTURE_FIXTURE,
        CONTACT_FIXTURE,
        DOCUMENT_FIXTURE,
        DOCUMENT_TYPE_FIXTURE,
    ]

    @classmethod
    def setUpTestData(cls):
        cls.test_object = MultipleOperator.objects.create(
            operation=Operation.objects.create(
                name="test",
                type="test",
                naics_code=NaicsCode.objects.first(),
                operator=Operator.objects.first(),
                previous_year_attributable_emissions=1,
                swrs_facility_id=1,
                bcghg_id=1,
                opt_in=True,
                verified_at=timezone.now(),
                verified_by=User.objects.get(user_guid="00000000-0000-0000-0000-000000000001"),
                application_lead=Contact.objects.first(),
                modifier=User.objects.first(),
            ),
            operator_index=1,
            legal_name="test",
            trade_name="test",
            cra_business_number=123456789,
            bc_corporate_registry_number='abc1234567',
            business_structure=BusinessStructure.objects.first(),
            website="test",
            percentage_ownership=100,
            physical_street_address="test",
            physical_municipality="test",
            physical_province="BC",
            physical_postal_code="V7W 3R4",
            mailing_address_same_as_physical=True,
            mailing_street_address="test",
            mailing_municipality="test",
            mailing_province="BC",
            mailing_postal_code="V7W 3R4",
            modifier=User.objects.first(),
        )
        cls.field_data = [
            *timestamp_common_fields,
            ("operator_index", "operator index", None, None),
            ("legal_name", "legal name", 1000, None),
            ("trade_name", "trade name", 1000, None),
            ("cra_business_number", "cra business number", None, None),
            ("bc_corporate_registry_number", "bc corporate registry number", None, None),
            ("business_structure", "business structure", None, None),
            ("website", "website", 200, None),
            ("percentage_ownership", "percentage ownership", None, None),
            ("physical_street_address", "physical street address", 1000, None),
            ("physical_municipality", "physical municipality", 1000, None),
            ("physical_province", "physical province", 2, None),
            ("physical_postal_code", "physical postal code", 7, None),
            ("mailing_address_same_as_physical", "mailing address same as physical", None, None),
            ("mailing_street_address", "mailing street address", 1000, None),
            ("mailing_municipality", "mailing municipality", 1000, None),
            ("mailing_province", "mailing province", 2, None),
            ("mailing_postal_code", "mailing postal code", 7, None),
        ]


@pytest.mark.usefixtures('document_baker', 'operation_baker', 'user_operator_baker', 'multiple_operator_baker')
class TestModelsWithAuditColumns(TestCase):
    models_with_audit_columns_and_field_to_update: List[Tuple[Type[models.Model], str]] = [
        (Document, 'description'),
        (Contact, 'first_name'),
        (Operator, 'legal_name'),
        (Operation, 'name'),
        (UserOperator, 'role'),
        (MultipleOperator, 'legal_name'),
    ]

    def setUp(self):
        [self.user_1, self.user_2] = baker.make(User, _quantity=2)

    def test_create_model_with_audit_columns(self):
        """
        Test that the model has the correct audit columns when created.
        """
        for data_model, _ in self.models_with_audit_columns_and_field_to_update:
            instance = data_model.objects.first()
            # check created_at and created_by are set
            self.assertIsNotNone(instance.created_at)
            self.assertIsNotNone(instance.created_by)
            # check updated_at and updated_by are set
            self.assertIsNotNone(
                instance.updated_at
            )  # when an object is created for the first time, updated_at is the same as created_at
            self.assertIsNone(instance.updated_by)
            # check archived_at and archived_by are None
            self.assertIsNone(instance.archived_at)
            self.assertIsNone(instance.archived_by)

    def test_update_model_with_audit_columns(self):
        """
        Test that the model has the correct audit columns when updated.
        """
        for data_model, field_to_update in self.models_with_audit_columns_and_field_to_update:
            instance = data_model.objects.first()
            created_at_before_update: timezone.datetime = instance.created_at

            # UPDATE
            setattr(instance, field_to_update, 'test')
            instance.save(modifier=self.user_1)

            # check created_at and created_by are not changed
            self.assertIsNotNone(instance.created_at)
            # make sure created_at is not changed
            self.assertEqual(instance.created_at, created_at_before_update)
            self.assertIsNotNone(instance.created_by)

            # check updated_at and updated_by are set
            self.assertIsNotNone(instance.updated_at)
            self.assertEqual(instance.updated_by, self.user_1)
            # make sure updated_at is changed and is not the same as created_at
            self.assertNotEqual(instance.updated_at, instance.created_at)
            # make sure updated_at is greater than created_at
            self.assertGreater(instance.updated_at, instance.created_at)

            # check archived_at and archived_by are None
            self.assertIsNone(instance.archived_at)
            self.assertIsNone(instance.archived_by)

    def test_archive_model_with_audit_columns(self):
        """
        Test that the model has the correct audit columns when archived.
        """
        for data_model, _ in self.models_with_audit_columns_and_field_to_update:
            instance = data_model.objects.first()
            created_at_before_archive: timezone.datetime = instance.created_at
            updated_at_before_archive: timezone.datetime = instance.updated_at
            updated_by_before_archive: timezone.datetime = instance.updated_by

            # ARCHIVE (soft delete by a different user)
            instance.archive(modifier=self.user_2)

            # check created_at and created_by are not changed
            self.assertIsNotNone(instance.created_at)
            self.assertIsNotNone(instance.created_by)
            # make sure created_at is not changed
            self.assertEqual(instance.created_at, created_at_before_archive)

            # check updated_at and updated_by are not changed
            self.assertIsNotNone(instance.updated_at)
            self.assertIsNotNone(instance.updated_by)
            # after archiving, updated_at is the same as archived_at
            self.assertNotEqual(instance.updated_at, updated_at_before_archive)
            self.assertNotEqual(instance.updated_by, updated_by_before_archive)

            # check archived_at and archived_by are set
            self.assertIsNotNone(instance.archived_at)
            self.assertEqual(instance.archived_by, self.user_2)
            # make sure archived_at is changed and is not the same as created_at
            self.assertNotEqual(instance.archived_at, instance.created_at)
            # make sure archived_at is greater than created_at
            self.assertGreater(instance.archived_at, instance.created_at)
            # updated_at and archived_at are the same (there is a small time difference between the two so we exclude the milliseconds)
            self.assertEqual(
                instance.updated_at.strftime('%Y-%m-%d %H:%M:%S'), instance.archived_at.strftime('%Y-%m-%d %H:%M:%S')
            )


class GetOrCreateTests(TestCase):  # using TestCase since pytest has some issues with bakers/fixtures
    fixtures = [APP_ROLE_FIXTURE, USER_FIXTURE]

    @classmethod
    def setUpTestData(cls):
        cls.user = User.objects.first()
        Document.objects.create(
            file="test",
            type=DocumentType.objects.create(name="test"),
            description="test",
            modifier=cls.user,
        )

    def test_get_or_create_method_with_get(self):
        _, created = Document.objects.get_or_create(
            file="test",
            type=DocumentType.objects.get(name="test"),
            modifier=self.user,
            defaults={"description": "test"},
        )
        self.assertFalse(created)
        self.assertEqual(Document.objects.count(), 1)

    def test_get_or_create_method_with_create(self):
        _, created = Document.objects.get_or_create(
            file="test2",
            type=DocumentType.objects.get(name="test"),
            modifier=self.user,
            defaults={"description": "test 2"},
        )
        self.assertTrue(created)
        self.assertEqual(Document.objects.count(), 2)

    def test_get_or_create_redundant_instance(self):
        """
        If we execute the exact same statement twice, the second time,
        it won't create a Person.
        """
        Document.objects.get_or_create(
            file="test 2",
            type=DocumentType.objects.get(name="test"),
            modifier=self.user,
            defaults={"description": "test 2"},
        )

        _, created = Document.objects.get_or_create(
            file="test 2",
            type=DocumentType.objects.get(name="test"),
            modifier=self.user,
            defaults={"description": "test 2"},
        )
        self.assertFalse(created)
        self.assertEqual(Document.objects.count(), 2)

    def test_get_or_create_invalid_params(self):
        """
        If you don't specify a value or default value for all required
        fields, you will get an error.
        """
        with self.assertRaises(IntegrityError):
            Document.objects.get_or_create(file="test 2", modifier=self.user)


class UpdateOrCreateTests(TestCase):  # using TestCase since pytest has some issues with bakers/fixtures
    fixtures = [APP_ROLE_FIXTURE, USER_FIXTURE]

    @classmethod
    def setUpTestData(cls):
        cls.user = User.objects.first()
        Document.objects.create(
            file="test",
            type=DocumentType.objects.create(name="test"),
            description="test",
            modifier=cls.user,
        )

    def test_update_or_create_method_with_update(self):
        _, created = Document.objects.update_or_create(
            file="test",
            type=DocumentType.objects.get(name="test"),
            modifier=self.user,
            defaults={"description": "test 2"},
        )
        self.assertFalse(created)
        self.assertEqual(Document.objects.count(), 1)
        self.assertEqual(Document.objects.first().description, "test 2")

    def test_update_or_create_method_with_create(self):
        _, created = Document.objects.update_or_create(
            file="test2",
            type=DocumentType.objects.get(name="test"),
            modifier=self.user,
            defaults={"description": "test 2"},
        )
        self.assertTrue(created)
        self.assertEqual(Document.objects.count(), 2)

    def test_update_or_create_redundant_instance(self):
        """
        If we execute the exact same statement twice, the second time,
        it won't create a Person.
        """
        Document.objects.update_or_create(
            file="test 2",
            type=DocumentType.objects.get(name="test"),
            modifier=self.user,
            defaults={"description": "test 2"},
        )

        _, created = Document.objects.update_or_create(
            file="test 2",
            type=DocumentType.objects.get(name="test"),
            modifier=self.user,
            defaults={"description": "test 2"},
        )
        self.assertFalse(created)
        self.assertEqual(Document.objects.count(), 2)

    def test_update_or_create_invalid_params(self):
        """
        If you don't specify a value or default value for all required
        fields, you will get an error.
        """
        with self.assertRaises(IntegrityError):
            Document.objects.update_or_create(file="test 2", modifier=self.user)
