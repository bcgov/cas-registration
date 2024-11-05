from datetime import datetime
from registration.models.bc_greenhouse_gas_id import BcGreenhouseGasId
from common.tests.utils.helpers import BaseTestCase
from registration.models import (
    BcObpsRegulatedOperation,
    Document,
    NaicsCode,
    Activity,
    RegulatedProduct,
    Operator,
    Operation,
)
from model_bakery import baker
from django.core.exceptions import ValidationError
from registration.tests.constants import (
    ADDRESS_FIXTURE,
    BC_OBPS_REGULATED_OPERATION_FIXTURE,
    BC_GREENHOUSE_GAS_ID_FIXTURE,
    CONTACT_FIXTURE,
    DOCUMENT_FIXTURE,
    OPERATION_FIXTURE,
    OPERATOR_FIXTURE,
    TIMESTAMP_COMMON_FIELDS,
    USER_FIXTURE,
)
from registration.tests.utils.bakers import operation_baker
import pytest


class OperationModelTest(BaseTestCase):
    fixtures = [
        ADDRESS_FIXTURE,
        USER_FIXTURE,
        CONTACT_FIXTURE,
        OPERATOR_FIXTURE,
        OPERATION_FIXTURE,
        DOCUMENT_FIXTURE,
        BC_OBPS_REGULATED_OPERATION_FIXTURE,
        BC_GREENHOUSE_GAS_ID_FIXTURE,
        BC_GREENHOUSE_GAS_ID_FIXTURE,
    ]

    @classmethod
    def setUpTestData(cls):
        cls.test_object = Operation.objects.filter(swrs_facility_id__isnull=False).first()
        cls.test_object.documents.set(
            [
                Document.objects.get(id=1),
                Document.objects.get(id=2),
            ]
        )

        cls.test_object.activities.set(
            [
                Activity.objects.create(name="test", applicable_to=Activity.Applicability.ALL, slug="test", weight=100),
                Activity.objects.create(
                    name="test2", applicable_to=Activity.Applicability.LFO, slug="test2", weight=200
                ),
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
            ("secondary_naics_code", "secondary naics code", None, None),
            ("tertiary_naics_code", "tertiary naics code", None, None),
            ("regulated_products", "regulated products", None, 2),
            ("activities", "activities", None, 2),
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
            ("multiple_operators", "multiple operator", None, None),
            ("facility_designated_operations", "facility designated operation timeline", None, None),
            ("designated_operators", "operation designated operator timeline", None, None),
            ("report", "report", None, None),
            ("registration_purposes", "registration purpose", None, None),
            ("opted_in_operation", "opted in operation", None, None),
            ("transfer_events", "transfer event", None, None),
            ("restart_events", "restart event", None, None),
            ("closure_events", "closure event", None, None),
            ("temporary_shutdown_events", "temporary shutdown event", None, None),
            ("contacts", "contacts", None, None),
            ("date_of_first_shipment", "date of first shipment", 1000, None),
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
        )

    def test_unique_swrs_facility_id_constraint(self):
        # First operation is `cls.test_object` from the fixture, attempt to create another operation with matching swrs_facility_id
        invalid_operation = operation_baker()
        invalid_operation.swrs_facility_id = self.test_object.swrs_facility_id

        with self.assertRaises(ValidationError, msg="Operation with this Swrs facility id already exists."):
            invalid_operation.save()

    # BCGHG ID generation tests

    def test_cannot_create_operation_with_duplicate_bcghg_id(self):
        bcghg_id_instance = baker.make(BcGreenhouseGasId, id='14121100001')
        operation_instance: Operation = baker.make_recipe('utils.operation')
        operation_instance.bcghg_id = bcghg_id_instance
        operation_instance.save(update_fields=['bcghg_id'])
        with pytest.raises(ValidationError, match='Operation with this Bcghg id already exists.'):
            baker.make_recipe('utils.operation', bcghg_id=bcghg_id_instance)

    def test_does_not_generate_if_operation_has_existing_bcghg_id(self):
        existing_id = baker.make(BcGreenhouseGasId, id='14121100001')
        self.test_object.bcghg_id = existing_id
        self.test_object.generate_unique_bcghg_id()
        assert self.test_object.bcghg_id == existing_id

    def test_does_not_generate_if_operation_type_is_invalid(self):
        self.test_object.bcghg_id = None
        self.test_object.type = 'Not my type'
        self.test_object.save()
        with pytest.raises(ValueError, match='Invalid operation type: Not my type'):
            self.test_object.generate_unique_bcghg_id()

    def test_generate_unique_bcghg_id(self):
        self.test_object.bcghg_id = None
        self.test_object.type = 'Linear Facility Operation'
        self.test_object.naics_code = baker.make(NaicsCode, naics_code='555555')
        self.test_object.generate_unique_bcghg_id()
        expected_id = '25555550001'
        assert self.test_object.bcghg_id.pk == expected_id

    def test_generate_unique_bcghg_id_multiple_existing_ids(self):
        existing_ids = ['13221210001', '13221210002', '13221210003', '23221210001', '23221210002', '14862100001']
        for existing_id in existing_ids:
            baker.make_recipe('utils.operation', bcghg_id=baker.make(BcGreenhouseGasId, id=existing_id))

        self.test_object.bcghg_id = None
        self.test_object.type = 'Single Facility Operation'
        self.test_object.naics_code = baker.make(NaicsCode, naics_code='322121')
        self.test_object.generate_unique_bcghg_id()
        expected_id = '13221210004'
        assert self.test_object.bcghg_id.pk == expected_id
