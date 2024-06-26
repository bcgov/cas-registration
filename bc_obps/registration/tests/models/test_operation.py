from datetime import datetime
from common.tests.utils.helpers import BaseTestCase
from registration.models import (
    BcObpsRegulatedOperation,
    Document,
    NaicsCode,
    ReportingActivity,
    RegulatedProduct,
    Operator,
    Operation,
)
from model_bakery import baker
from django.core.exceptions import ValidationError
from registration.tests.constants import (
    ADDRESS_FIXTURE,
    BC_OBPS_REGULATED_OPERATION_FIXTURE,
    CONTACT_FIXTURE,
    DOCUMENT_FIXTURE,
    OPERATION_FIXTURE,
    OPERATOR_FIXTURE,
    TIMESTAMP_COMMON_FIELDS,
    USER_FIXTURE,
)
from registration.tests.utils.bakers import operation_baker


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
        # Get the first operation from the fixture with a swrs_facility_id so we can test the unique constraint
        cls.test_object = Operation.objects.filter(swrs_facility_id__isnull=False).first()
        cls.test_object.documents.set(
            [
                Document.objects.get(id=1),
                Document.objects.get(id=2),
            ]
        )

        cls.test_object.reporting_activities.set(
            [
                ReportingActivity.objects.create(name="test", applicable_to=ReportingActivity.Applicability.ALL),
                ReportingActivity.objects.create(name="test2", applicable_to=ReportingActivity.Applicability.LFO),
            ]
        )
        cls.test_object.regulated_products.set(
            [
                RegulatedProduct.objects.create(name="test"),
                RegulatedProduct.objects.create(name="test2"),
            ]
        )
        cls.field_data = [
            *TIMESTAMP_COMMON_FIELDS,
            ("id", "ID", None, None),
            ("name", "name", 1000, None),
            ("type", "type", 1000, None),
            ("naics_code", "naics code", None, None),
            ("regulated_products", "regulated products", None, 2),
            ("reporting_activities", "reporting activities", None, 2),
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
            ("facility_ownerships", "facility ownership timeline", None, None),
            ("ownerships", "operation ownership timeline", None, None),
            ("events", "event", None, None),
            ("report", "report", None, None),
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
        self.test_object.generate_unique_boro_id()
        self.assertEqual(
            self.test_object.bc_obps_regulated_operation, existing_id, "Should not change the existing ID."
        )

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
