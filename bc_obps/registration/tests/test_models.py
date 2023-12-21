from datetime import datetime
from typing import List, Tuple, Type
from django.db import IntegrityError, models
from django.test import TestCase
from django.utils import timezone
from registration.models import (
    BcObpsRegulatedOperation,
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
from model_bakery import baker
from django.core.exceptions import ValidationError


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
        if isinstance(field, models.ManyToOneRel) or isinstance(field, models.ManyToManyRel):
            # If the field is a ManyToOneRel or ManyToManyRel, get the field from the related model
            self.assertEqual(field.related_model._meta.verbose_name, expected_label)
        else:
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

    def test_field_data_length(self):
        if hasattr(self, "test_object") and hasattr(self, "field_data"):
            # check that the number of fields in the model is the same as the number of fields in the field_data list
            self.assertEqual(len(self.field_data), len(self.test_object._meta.get_fields()))


class DocumentTypeModelTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        cls.field_data = [("id", "ID", None, None), ("name", "name", 1000, None), ("documents", "document", None, None)]
        cls.test_object = DocumentType.objects.create(
            name="test",
        )


class DocumentModelTest(BaseTestCase):
    fixtures = [DOCUMENT_FIXTURE, DOCUMENT_TYPE_FIXTURE]

    @classmethod
    def setUpTestData(cls):
        cls.field_data = [
            *timestamp_common_fields,
            ("id", "ID", None, None),
            ("file", "file", None, None),
            ("type", "type", None, None),
            ("description", "description", 1000, None),
            ("users", "user", None, None),
            ("operators", "operator", None, None),
            ("operations", "operation", None, None),
            ("contacts", "contact", None, None),
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
            ("id", "ID", None, None),
            ("naics_code", "naics code", 1000, None),
            ("naics_description", "naics description", 1000, None),
            ("operations", "operation", None, None),
        ]


class RegulatedProductModelTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        cls.field_data = [
            ("id", "ID", None, None),
            ("name", "name", 1000, None),
            ("operations", "operation", None, None),
        ]
        cls.test_object = RegulatedProduct.objects.create(
            name="test product",
        )


class ReportingActivityModelTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        cls.field_data = [
            ("id", "ID", None, None),
            ("name", "name", 1000, None),
            ("applicable_to", "applicable to", None, None),
            ("operations", "operation", None, None),
        ]
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
            ("operators_verified_by", "operator", None, None),
            ("user_operators", "user operator", None, None),
            ("user_operators_verified_by", "user operator", None, None),
            ("operation_verified_by", "operation", None, None),
            # related models by TimestampedModel
            ("document_created", "document", None, None),
            ("document_updated", "document", None, None),
            ("document_archived", "document", None, None),
            ("contact_created", "contact", None, None),
            ("contact_updated", "contact", None, None),
            ("contact_archived", "contact", None, None),
            ("operator_created", "operator", None, None),
            ("operator_updated", "operator", None, None),
            ("operator_archived", "operator", None, None),
            ("useroperator_created", "user operator", None, None),
            ("useroperator_updated", "user operator", None, None),
            ("useroperator_archived", "user operator", None, None),
            ("operation_created", "operation", None, None),
            ("operation_updated", "operation", None, None),
            ("operation_archived", "operation", None, None),
            ("multipleoperator_created", "multiple operator", None, None),
            ("multipleoperator_updated", "multiple operator", None, None),
            ("multipleoperator_archived", "multiple operator", None, None),
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
            ("id", "ID", None, None),
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
            ("documents", "documents", None, None),
            ("operators", "operator", None, None),
            ("operations", "operation", None, None),
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
            )

        cls.field_data = [
            *timestamp_common_fields,
            ("id", "ID", None, None),
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
            ("operations", "operation", None, None),
            ("user_operators", "user operator", None, 2),
            ("parent_child_operator_parent_operators", "parent child operator", None, None),
            ("parent_child_operator_child_operators", "parent child operator", None, None),
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
            ("id", "ID", None, None),
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
        )
        cls.field_data = [
            *timestamp_common_fields,
            ("id", "ID", None, None),
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
            ("id", "ID", None, None),
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
            ("bc_obps_regulated_operation", "bc obps regulated operation", None, None),
            ("operation_has_multiple_operators", "operation has multiple operators", None, None),
            ("operator", "operator", None, None),
            ("status", "status", 1000, None),
            ("multiple_operator", "multiple operator", None, None),
        ]

    def test_unique_boro_id_per_operation(self):
        boro_id_instance = baker.make(BcObpsRegulatedOperation, id='23-0001')
        baker.make(Operation, bc_obps_regulated_operation=boro_id_instance)

        with self.assertRaises(IntegrityError):
            baker.make(
                Operation,
                bc_obps_regulated_operation=boro_id_instance,
                name='test',
                type='test',
                naics_code=NaicsCode.objects.first(),
                operator=Operator.objects.first(),
            )

    def test_generate_unique_boro_id_existing_id(self):
        # Case: Operation already has a BORO ID
        existing_id = baker.make(BcObpsRegulatedOperation, id='23-0001')  # Example existing ID for the current year
        self.test_object.bc_obps_regulated_operation = existing_id
        generated_id = self.test_object.generate_unique_boro_id()
        self.assertEqual(generated_id, existing_id, "Should return the existing ID.")

    def test_generate_unique_boro_id_no_existing_id(self):
        # Case: No existing BORO ID
        self.test_object.bc_obps_regulated_operation = None
        self.test_object.generate_unique_boro_id()
        current_year = datetime.now().year % 100
        expected_id = f"{current_year:02d}-0001"  # Assuming the first ID for the year
        self.assertEqual(
            self.test_object.bc_obps_regulated_operation.pk,
            expected_id,
            "Should generate a new ID for the current year.",
        )

    def test_generate_unique_boro_id_multiple_existing_ids_same_year(self):
        # Case: Multiple existing BORO IDs for the current year
        existing_ids = ["23-0002", "23-0003", "23-0001"]
        Operation.objects.bulk_create(
            [
                Operation(
                    name="test",
                    type="test",
                    naics_code=NaicsCode.objects.first(),
                    operator=Operator.objects.first(),
                    bc_obps_regulated_operation=baker.make(BcObpsRegulatedOperation, id=existing_id),
                )
                for existing_id in existing_ids
            ]
        )

        self.test_object.bc_obps_regulated_operation = None
        self.test_object.generate_unique_boro_id()
        current_year = datetime.now().year % 100
        expected_id = f"{current_year:02d}-0004"
        self.assertEqual(
            self.test_object.bc_obps_regulated_operation.pk,
            expected_id,
            "Should generate a new ID for the current year.",
        )

    def test_generate_unique_boro_id_multiple_existing_ids_different_year(self):
        # Case: Multiple existing BORO IDs for the current year
        existing_ids = ["22-0001", "22-0002", "22-0003"]
        Operation.objects.bulk_create(
            [
                Operation(
                    name="test",
                    type="test",
                    naics_code=NaicsCode.objects.first(),
                    operator=Operator.objects.first(),
                    bc_obps_regulated_operation=baker.make(BcObpsRegulatedOperation, id=existing_id),
                )
                for existing_id in existing_ids
            ]
        )

        self.test_object.bc_obps_regulated_operation = None
        self.test_object.generate_unique_boro_id()
        current_year = datetime.now().year % 100
        expected_id = f"{current_year:02d}-0001"
        self.assertEqual(
            self.test_object.bc_obps_regulated_operation.pk,
            expected_id,
            "Should generate a new ID for the current year.",
        )


class AppRoleModelTest(BaseTestCase):
    fixtures = [APP_ROLE_FIXTURE]

    @classmethod
    def setUpTestData(cls):
        cls.test_object = AppRole.objects.first()
        cls.field_data = [
            ("role_name", "role name", 100, None),
            ("role_description", "role description", 1000, None),
            ("users", "user", None, None),
        ]

    def test_initial_data(self):
        expected_roles = sorted(['cas_admin', 'cas_analyst', 'cas_pending', 'industry_user', 'industry_user_admin'])
        existing_roles = sorted(list(AppRole.objects.values_list('role_name', flat=True)))

        self.assertEqual(len(existing_roles), len(expected_roles))
        self.assertEqual(existing_roles, expected_roles)


class BusinessRoleModelTest(BaseTestCase):
    fixtures = [BUSINESS_ROLE_FIXTURE]

    @classmethod
    def setUpTestData(cls):
        cls.test_object = BusinessRole.objects.first()
        cls.field_data = [
            ("role_name", "role name", 100, None),
            ("role_description", "role description", 1000, None),
            ("contacts", "contact", None, None),
        ]

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
        )
        cls.field_data = [
            *timestamp_common_fields,
            ("id", "ID", None, None),
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
            ("operation", "operation", None, None),
        ]


class TestBcObpsRegulatedOperationModel(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        cls.test_object = BcObpsRegulatedOperation.objects.create(
            id='23-0001', issued_at=timezone.now(), comments='test'
        )
        cls.field_data = [
            ("id", "id", None, None),  # this is not ID because we override the default ID field
            ("issued_at", "issued at", None, None),
            ("comments", "comments", None, None),
            ("operation", "operation", None, None),
        ]

    def test_check_id_format(self):
        valid_ids = ['24-0001', '20-1234', '18-5678']
        for id in valid_ids:
            self.test_object.id = id
            self.test_object.save()

        invalid_ids = ['240001', '24-ABCD', '24_0001', '24-']
        for id in invalid_ids:
            self.test_object.id = id
            with self.assertRaises(ValidationError):
                self.test_object.save()

    def test_id_should_be_unique(self):
        # not using baker.make because it doesn't raise an error when the id is not unique
        with self.assertRaises(IntegrityError):
            BcObpsRegulatedOperation.objects.create(id='23-0001', comments='test')  # already created in setUpTestData


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

    def test_set_audit_columns(self):
        for model, field_to_update in self.models_with_audit_columns_and_field_to_update:
            instance = baker.make(model)

            # CREATE
            instance.set_create_or_update(modifier=self.user_1)
            self.assertIsNotNone(instance.created_at)
            self.assertEqual(instance.created_by, self.user_1)

            self.assertIsNone(instance.updated_at)
            self.assertIsNone(instance.updated_by)
            self.assertIsNone(instance.archived_at)
            self.assertIsNone(instance.archived_by)

            # UPDATE
            model.objects.filter(id=instance.id).update(**{field_to_update: 'updated'})
            instance.set_create_or_update(modifier=self.user_2)
            instance.refresh_from_db()
            self.assertIsNotNone(instance.created_at)
            self.assertEqual(instance.created_by, self.user_1)
            self.assertIsNotNone(instance.updated_at)
            self.assertGreater(instance.updated_at, instance.created_at)
            self.assertEqual(instance.updated_by, self.user_2)
            self.assertIsNone(instance.archived_at)
            self.assertIsNone(instance.archived_by)

            # ARCHIVE
            instance.set_archive(modifier=self.user_1)
            self.assertIsNotNone(instance.created_at)
            self.assertEqual(instance.created_by, self.user_1)
            self.assertIsNotNone(instance.updated_at)
            self.assertGreater(instance.updated_at, instance.created_at)
            self.assertEqual(instance.updated_by, self.user_2)
            self.assertIsNotNone(instance.archived_at)
            self.assertEqual(instance.archived_by, self.user_1)
            self.assertGreater(instance.archived_at, instance.created_at)
            self.assertGreater(instance.archived_at, instance.updated_at)

    def test_invalid_action_type_handling(self):
        for model, _ in self.models_with_audit_columns_and_field_to_update:
            instance = baker.make(model)
            with self.assertRaises(AttributeError):
                instance.set_delete(modifier=self.user_1)

    def test_no_modifier_provided(self):
        for model, _ in self.models_with_audit_columns_and_field_to_update:
            instance = baker.make(model)
            with self.assertRaises(TypeError):
                instance.set_create_or_update()

    def test_existing_audit_columns_presence(self):
        for model, field_to_update in self.models_with_audit_columns_and_field_to_update:
            # Create an instance with existing audit columns set
            instance = baker.make(model, created_by=self.user_1)

            # Save the initial audit values for comparison
            initial_created_at = instance.created_at
            initial_created_by = instance.created_by

            # Perform an action
            model.objects.filter(id=instance.id).update(**{field_to_update: 'updated'})
            instance.set_create_or_update(modifier=self.user_2)
            instance.refresh_from_db()

            # Ensure existing audit columns remain unchanged
            self.assertEqual(instance.created_at, initial_created_at)
            self.assertEqual(instance.created_by, initial_created_by)
            self.assertGreater(instance.updated_at, instance.created_at)
            self.assertNotEqual(instance.updated_by, instance.created_by)
            # Ensure updated audit columns are correctly set
            self.assertEqual(instance.updated_by, self.user_2)
