from datetime import datetime
from typing import Callable, List, Tuple, Type
from django.db import models
from django.test import TestCase
from django.utils import timezone
from registration.models import (
    Address,
    BcObpsRegulatedOperation,
    BusinessRole,
    BusinessStructure,
    DocumentType,
    Document,
    NaicsCode,
    ReportingActivity,
    RegulatedProduct,
    TimeStampedModel,
    User,
    Contact,
    Operator,
    UserOperator,
    ParentOperator,
    Operation,
    MultipleOperator,
    AppRole,
)
from model_bakery import baker
from django.core.exceptions import ValidationError
from registration.tests.utils.bakers import (
    contact_baker,
    document_baker,
    multiple_operator_baker,
    operator_baker,
    operation_baker,
    parent_operator_baker,
    user_operator_baker,
)


OPERATOR_FIXTURE = ("mock/operator.json",)
USER_FIXTURE = ("mock/user.json",)
ADDRESS_FIXTURE = ("mock/address.json",)
OPERATION_FIXTURE = ("mock/operation.json",)
CONTACT_FIXTURE = ("mock/contact.json",)
DOCUMENT_FIXTURE = ("mock/document.json",)
BC_OBPS_REGULATED_OPERATION_FIXTURE = ("mock/bc_obps_regulated_operation.json",)


timestamp_common_fields = [
    ("created_at", "created at", None, None),
    ("created_by", "created by", None, None),
    ("updated_at", "updated at", None, None),
    ("updated_by", "updated by", None, None),
    ("archived_at", "archived at", None, None),
    ("archived_by", "archived by", None, None),
]


class TestInitialData(TestCase):
    def test_app_role_initial_data(self):
        expected_roles = sorted(['cas_admin', 'cas_analyst', 'cas_pending', 'industry_user'])
        existing_roles = sorted(list(AppRole.objects.values_list('role_name', flat=True)))

        self.assertEqual(len(existing_roles), len(expected_roles))
        self.assertEqual(existing_roles, expected_roles)

    def test_business_role_initial_data(self):
        expected_roles = sorted(
            ['Senior Officer', 'Operation Representative', 'Authorized Signing Officer', 'Operation Registration Lead']
        )
        existing_roles = sorted(list(BusinessRole.objects.values_list('role_name', flat=True)))

        self.assertEqual(len(existing_roles), len(expected_roles))
        self.assertEqual(existing_roles, expected_roles)

    def test_business_structure_initial_data(self):
        expected_structures = sorted(
            [
                'General Partnership',
                'BC Corporation',
                'Extra Provincially Registered Company',
                'Sole Proprietorship',
                'Limited Liability Partnership',
                'BC Incorporated Society',
                'Extraprovincial Non-Share Corporation',
            ]
        )
        existing_structures = sorted(list(BusinessStructure.objects.values_list('name', flat=True)))

        self.assertEqual(len(existing_structures), len(expected_structures))
        self.assertEqual(existing_structures, expected_structures)

    def test_document_type_initial_data(self):
        expected_types = sorted(
            [
                'boundary_map',
                'signed_statutory_declaration',
                'process_flow_diagram',
                'proof_of_authority_of_partner_company',
                'senior_officer_proof_of_authority',
                'operation_representative_proof_of_authority',
                'soce_senior_officer_proof_of_authority',
                'proof_of_start',
                'opt_in_signed_statutory_declaration',
            ]
        )
        existing_types = sorted(list(DocumentType.objects.values_list('name', flat=True)))

        self.assertEqual(len(existing_types), len(expected_types))
        self.assertEqual(existing_types, expected_types)

    def test_naics_code_initial_data(self):
        expected_codes = sorted(
            [
                ('211110', 'Oil and gas extraction (except oil sands)'),
                ('212114', 'Bituminous coal mining'),
                ('212220', 'Gold and silver ore mining'),
                ('212231', 'Lead-zinc ore mining'),
                ('212233', 'Copper-zinc ore mining'),
                ('212299', 'All other metal ore mining'),
                ('213118', 'Services to oil and gas extraction'),
                ('311119', 'Other animal food manufacturing'),
                ('311310', 'Sugar manufacturing'),
                ('311614', 'Rendering and meat processing from carcasses'),
                ('321111', 'Sawmills (except shingle and shake mills)'),
                ('321212', 'Softwood veneer and plywood mills'),
                ('321216', 'Particle board and fibreboard mills'),
                ('321999', 'All other miscellaneous wood product manufacturing'),
                ('322111', 'Mechanical pulp mills'),
                ('322112', 'Chemical pulp mills'),
                ('322121', 'Paper (except newsprint) mills'),
                ('322122', 'Newsprint mills'),
                ('324110', 'Petroleum refineries'),
                ('325120', 'Industrial gas manufacturing'),
                ('325181', 'Alkali and chlorine manufacturing'),
                ('325189', 'All other basic inorganic chemical manufacturing'),
                ('327310', 'Cement manufacturing'),
                ('327410', 'Lime manufacturing'),
                ('327420', 'Gypsum product manufacturing'),
                ('327990', 'All other non-metallic mineral product manufacturing'),
                ('331222', 'Steel wire drawing'),
                ('331313', 'Primary production of alumina and aluminum'),
                ('331410', 'Non-ferrous metal (except aluminum) smelting and refining'),
                ('331511', 'Iron foundries'),
                ('412110', 'Petroleum, petroleum products, and other hydrocarbons merchant wholesalers'),
                ('486210', 'Pipeline transportation of natural gas'),
            ]
        )
        existing_codes = sorted(list(NaicsCode.objects.values_list('naics_code', 'naics_description')))
        self.assertEqual(len(existing_codes), len(expected_codes))
        self.assertEqual(existing_codes, expected_codes)

    def test_regulated_product_initial_data(self):
        expected_products = sorted(
            [
                'Baked anodes',
                'BC-specific refinery complexity throughput',
                'Cement equivalent',
                'Chemicals: pure hydrogen peroxide',
                'Compression, centrifugal - consumed energy',
                'Compression, positive displacement - consumed energy',
                'Calcined green coke',
                'Gypsum wallboard',
                'HDG-process (hot dip galvanization) steel wire',
                'Lime at 94.5% calcium oxide (CaO) and lime kiln dust (LKD)',
                'Limestone for sale',
                'Liquid sugar',
                'Solid Sugar',
                'Mining: co',
                'Mining: copper equivalent, open pit',
                'Mining: copper equivalent, underground',
                'Mining: gold equivalent',
                'Non-HDG steel wire',
                'Pulp and paper: paper (except newsprint)',
                'Processing sour gas - oil equivalent',
                'Processing sweet gas - oil equivalent',
                'Pulp and paper: chemical pulp',
                'Pulp and paper: non-chemical pulp',
                'Rendering and meat processing: protein and fat',
                'Smelting: aluminum',
                'Smelting: lead-zinc',
                'Sold electricity',
                'Sold heat',
                'Wood products: lumber',
                'Wood products: medium density fibreboard',
                'Wood products: plywood',
                'Wood products: veneer',
                'Wood products: wood chips (including hog fuel)',
                'Wood products: wood pellets',
            ]
        )
        existing_products = sorted(list(RegulatedProduct.objects.values_list('name', flat=True)))
        self.assertEqual(len(existing_products), len(expected_products))
        self.assertEqual(existing_products, expected_products)

    def test_reporting_activity_initial_data(self):
        expected_activities = sorted(
            [
                ('General stationary combustion', 'all'),
                ('Fuel combustion by mobile equipment', 'sfo'),
                ('Aluminum or alumina production', 'sfo'),
                ('Ammonia production', 'sfo'),
                ('Cement production', 'sfo'),
                ('Underground coal mining', 'sfo'),
                ('Coal storage at facilities that combust coal', 'sfo'),
                ('Copper or nickel smelting or refining', 'sfo'),
                ('Electricity generation', 'sfo'),
                ('Electronics manufacturing', 'sfo'),
                ('Ferroalloy production', 'sfo'),
                ('Glass manufacturing', 'sfo'),
                ('Hydrogen production', 'sfo'),
                ('Industrial wastewater processing', 'sfo'),
                ('Lead production', 'sfo'),
                ('Lime manufacturing', 'sfo'),
                ('Magnesium production', 'sfo'),
                ('Nitric acid manufacturing', 'sfo'),
                ('Petrochemical production', 'sfo'),
                ('Petroleum refining', 'sfo'),
                ('Phosphoric acid production', 'sfo'),
                ('Pulp and paper production', 'sfo'),
                ('Refinery fuel gas combustion', 'sfo'),
                ('Zinc production', 'sfo'),
                ('Open pit coal mining', 'sfo'),
                ('Storage of petroleum products', 'sfo'),
                ('Carbonate use', 'sfo'),
                ('Oil and gas extraction and gas processing activities', 'lfo'),
                ('Carbon dioxide transportation and oil transmission', 'lfo'),
                ('Electricity transmission', 'lfo'),
                ('Natural gas transmission', 'lfo'),
                ('Natural gas distribution', 'lfo'),
                ('Natural gas storage', 'lfo'),
                ('LNG activities', 'lfo'),
            ]
        )
        existing_activities = sorted(list(ReportingActivity.objects.values_list('name', 'applicable_to')))
        self.assertEqual(len(existing_activities), len(expected_activities))
        self.assertEqual(existing_activities, expected_activities)


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
    fixtures = [DOCUMENT_FIXTURE]

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
            applicable_to=ReportingActivity.Applicablity.ALL,
        )


class UserModelTest(BaseTestCase):
    fixtures = [USER_FIXTURE, DOCUMENT_FIXTURE]

    @classmethod
    def setUpTestData(cls):
        cls.test_object = User.objects.get(user_guid="3fa85f64-5717-4562-b3fc-2c963f66afa6")
        cls.test_object.documents.set([Document.objects.get(id=1), Document.objects.get(id=2)])
        cls.field_data = [
            ("first_name", "first name", 1000, None),
            ("last_name", "last name", 1000, None),
            ("position_title", "position title", 1000, None),
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
            ("parentoperator_created", "parent operator", None, None),
            ("parentoperator_updated", "parent operator", None, None),
            ("parentoperator_archived", "parent operator", None, None),
        ]

    def test_unique_user_guid_and_business_guid_constraint(self):
        # First user is `cls.test_object` from the fixture, attempt to create another user with the same user_guid and business_guid
        user2 = User(
            first_name="fname-test2",
            last_name="lname-test2",
            position_title="Manager",
            email="alicesmith@example.com",
            phone_number="+16044011234",
            user_guid="3fa85f64-5717-4562-b3fc-2c963f66afa6",
            business_guid="11111111-1111-1111-1111-111111111111",
            app_role=AppRole.objects.get(role_name="cas_admin"),
        )

        with self.assertRaises(ValidationError, msg="User with this User guid already exists."):
            user2.save()


class ContactModelTest(BaseTestCase):
    fixtures = [ADDRESS_FIXTURE, USER_FIXTURE, CONTACT_FIXTURE, DOCUMENT_FIXTURE]

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
            ("address", "address", None, None),
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


class OperatorModelTest(BaseTestCase):
    fixtures = [ADDRESS_FIXTURE, CONTACT_FIXTURE, OPERATOR_FIXTURE, USER_FIXTURE, DOCUMENT_FIXTURE]

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
            ("physical_address", "physical address", None, None),
            ("mailing_address", "mailing address", None, None),
            ("website", "website", 200, None),
            ("documents", "documents", None, 2),
            ("contacts", "contacts", None, 2),
            ("status", "status", 1000, None),
            ("verified_by", "verified by", None, None),
            ("verified_at", "verified at", None, None),
            ("is_new", "is new", None, None),
            ("operations", "operation", None, None),
            ("user_operators", "user operator", None, 2),
            ("parent_operators", "parent operator", None, None),
        ]

    def test_unique_cra_business_number_constraint(self):
        # First operator is `cls.test_object` from the fixture, attempt to create another operator with matching cra_business_number
        invalid_operator = Operator(
            legal_name="test",
            trade_name="test",
            cra_business_number=self.test_object.cra_business_number,
            bc_corporate_registry_number='abc1234567',
            business_structure=BusinessStructure.objects.first(),
            physical_address=Address.objects.first(),
            mailing_address=Address.objects.first(),
        )

        with self.assertRaises(ValidationError, msg="Operator with this Cra business number already exists."):
            invalid_operator.save()


class ParentOperatorModelTest(BaseTestCase):
    fixtures = [
        USER_FIXTURE,
        ADDRESS_FIXTURE,
        CONTACT_FIXTURE,
        OPERATOR_FIXTURE,
    ]

    @classmethod
    def setUpTestData(cls):
        cls.test_object = parent_operator_baker()
        cls.field_data = [
            *timestamp_common_fields,
            ("id", "ID", None, None),
            ("child_operator", "child operator", None, None),
            ("operator_index", "operator index", None, None),
            ("legal_name", "legal name", 1000, None),
            ("trade_name", "trade name", 1000, None),
            ("cra_business_number", "cra business number", None, None),
            ("bc_corporate_registry_number", "bc corporate registry number", None, None),
            ("business_structure", "business structure", None, None),
            ("website", "website", 200, None),
            ("physical_address", "physical address", None, None),
            ("mailing_address", "mailing address", None, None),
        ]


class UserOperatorModelTest(BaseTestCase):
    fixtures = [ADDRESS_FIXTURE, CONTACT_FIXTURE, OPERATOR_FIXTURE, USER_FIXTURE]

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
        ADDRESS_FIXTURE,
        USER_FIXTURE,
        CONTACT_FIXTURE,
        OPERATOR_FIXTURE,
        OPERATION_FIXTURE,
        DOCUMENT_FIXTURE,
        BC_OBPS_REGULATED_OPERATION_FIXTURE,
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
                ReportingActivity.objects.create(name="test", applicable_to=ReportingActivity.Applicablity.ALL),
                ReportingActivity.objects.create(name="test2", applicable_to=ReportingActivity.Applicablity.LFO),
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
            ("submission_date", "submission date", None, None),
            ("point_of_contact", "point of contact", None, None),
            ("documents", "documents", None, 2),
            ("bc_obps_regulated_operation", "bc obps regulated operation", None, None),
            ("operation_has_multiple_operators", "operation has multiple operators", None, None),
            ("operator", "operator", None, None),
            ("status", "status", 1000, None),
            ("multiple_operator", "multiple operator", None, None),
        ]

    def test_unique_boro_id_per_operation(self):
        boro_id_instance = baker.make(BcObpsRegulatedOperation, id='23-0001')
        operation_instance: Operation = operation_baker()
        operation_instance.bc_obps_regulated_operation = boro_id_instance
        operation_instance.save(update_fields=['bc_obps_regulated_operation'])

        with self.assertRaises(ValidationError, msg="Operation with this Bc obps regulated operation already exists."):
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
        current_year = datetime.now().year % 100
        # Case: Multiple existing BORO IDs for the current year
        current_year = datetime.now().year % 100
        existing_ids = [f"{current_year:02d}-0002", f"{current_year:02d}-0003", f"{current_year:02d}-0001"]
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

    def test_unique_swrs_facility_id_constraint(self):
        # First operation is `cls.test_object` from the fixture, attempt to create another operation with matching swrs_facility_id
        invalid_operation = operation_baker()
        invalid_operation.swrs_facility_id = self.test_object.swrs_facility_id

        with self.assertRaises(ValidationError, msg="Operation with this Swrs facility id already exists."):
            invalid_operation.save()


class AppRoleModelTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        cls.test_object = AppRole.objects.first()
        cls.field_data = [
            ("role_name", "role name", 100, None),
            ("role_description", "role description", 1000, None),
            ("users", "user", None, None),
        ]

    def test_initial_data(self):
        expected_roles = sorted(['cas_admin', 'cas_analyst', 'cas_pending', 'industry_user'])
        existing_roles = sorted(list(AppRole.objects.values_list('role_name', flat=True)))

        self.assertEqual(len(existing_roles), len(expected_roles))
        self.assertEqual(existing_roles, expected_roles)

    def test_static_methods(self):
        self.assertEqual(AppRole.get_authorized_irc_roles(), ['cas_admin', 'cas_analyst'])
        self.assertEqual(AppRole.get_all_authorized_app_roles(), ['cas_admin', 'cas_analyst', 'industry_user'])
        self.assertEqual(AppRole.get_all_app_roles(), ['cas_admin', 'cas_analyst', 'cas_pending', 'industry_user'])
        self.assertEqual(UserOperator.get_all_industry_user_operator_roles(), ['admin', 'reporter', None])


class BusinessRoleModelTest(BaseTestCase):
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
    fixtures = [ADDRESS_FIXTURE, USER_FIXTURE, CONTACT_FIXTURE, OPERATOR_FIXTURE, DOCUMENT_FIXTURE]

    @classmethod
    def setUpTestData(cls):
        cls.test_object = multiple_operator_baker()
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
            ("physical_address", "physical address", None, None),
            ("mailing_address_same_as_physical", "mailing address same as physical", None, None),
            ("mailing_address", "mailing address", None, None),
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
        with self.assertRaises(ValidationError, msg='Bc obps regulated operation with this Id already exists.'):
            BcObpsRegulatedOperation.objects.create(id='23-0001', comments='test')  # already created in setUpTestData


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
            ("multiple_operator_physical", "multiple operator", None, None),
            ("multiple_operator_mailing", "multiple operator", None, None),
            ("parent_operators_physical", "parent operator", None, None),
            ("parent_operators_mailing", "parent operator", None, None),
        ]


class TestModelsWithAuditColumns(TestCase):
    models_with_audit_columns_and_field_to_update: List[Tuple[Type[models.Model], str, Callable]] = [
        (Document, 'description', document_baker),
        (Contact, 'first_name', contact_baker),
        (Operator, 'legal_name', operator_baker),
        (Operation, 'name', operation_baker),
        (UserOperator, 'role', user_operator_baker),
        (MultipleOperator, 'legal_name', multiple_operator_baker),
        (ParentOperator, 'legal_name', parent_operator_baker),
    ]

    def setUp(self):
        [self.user_1, self.user_2] = baker.make(User, _quantity=2)

    def test_set_audit_columns(self):
        for model, field_to_update, model_baker in self.models_with_audit_columns_and_field_to_update:
            instance: Type[TimeStampedModel] = model_baker()
            # CREATE
            instance.set_create_or_update(modifier=self.user_1)
            self.assertIsNotNone(instance.created_at)
            self.assertEqual(instance.created_by, self.user_1)

            self.assertIsNone(instance.updated_at)
            self.assertIsNone(instance.updated_by)
            self.assertIsNone(instance.archived_at)
            self.assertIsNone(instance.archived_by)

            # UPDATE
            model_data_field_has_choices = model._meta.get_field(field_to_update).choices
            model.objects.filter(id=instance.id).update(
                **{field_to_update: model_data_field_has_choices[0][0] if model_data_field_has_choices else 'updated'}
            )
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
        for _, _, model_baker in self.models_with_audit_columns_and_field_to_update:
            instance: Type[TimeStampedModel] = model_baker()
            with self.assertRaises(AttributeError):
                instance.set_delete(modifier=self.user_1)

    def test_no_modifier_provided(self):
        for _, _, model_baker in self.models_with_audit_columns_and_field_to_update:
            instance: Type[TimeStampedModel] = model_baker()
            with self.assertRaises(TypeError):
                instance.set_create_or_update()

    def test_existing_audit_columns_presence(self):
        for model, field_to_update, model_baker in self.models_with_audit_columns_and_field_to_update:
            instance: Type[TimeStampedModel] = model_baker()
            instance.set_create_or_update(modifier=self.user_1)

            # Save the initial audit values for comparison
            initial_created_at = instance.created_at
            initial_created_by = instance.created_by

            # Perform an action
            model_data_field_has_choices = model._meta.get_field(field_to_update).choices
            model.objects.filter(id=instance.id).update(
                **{field_to_update: model_data_field_has_choices[0][0] if model_data_field_has_choices else 'updated'}
            )
            instance.set_create_or_update(modifier=self.user_2)
            instance.refresh_from_db()

            # Ensure existing audit columns remain unchanged
            self.assertEqual(instance.created_at, initial_created_at)
            self.assertEqual(instance.created_by, initial_created_by)
            self.assertGreater(instance.updated_at, instance.created_at)
            self.assertNotEqual(instance.updated_by, instance.created_by)
            # Ensure updated audit columns are correctly set
            self.assertEqual(instance.updated_by, self.user_2)
