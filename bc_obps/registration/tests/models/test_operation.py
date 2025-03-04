from datetime import datetime
from registration.models.bc_greenhouse_gas_id import BcGreenhouseGasId
from common.tests.utils.helpers import BaseTestCase
from registration.models import (
    BcObpsRegulatedOperation,
    NaicsCode,
    Activity,
    RegulatedProduct,
    Operator,
    Operation,
    User,
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
        cls.test_object = baker.make_recipe(
            'registration.tests.utils.operation', swrs_facility_id=6565, status=Operation.Statuses.REGISTERED
        )
        Operation.objects.filter(swrs_facility_id__isnull=False).first()

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
                RegulatedProduct.objects.create(name="test", unit="test unit", is_regulated=True),
                RegulatedProduct.objects.create(name="test2", unit="test2 unit2", is_regulated=False),
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
            ("documents", "document", None, None),
            ("bc_obps_regulated_operation", "bc obps regulated operation", None, None),
            ("operation_has_multiple_operators", "operation has multiple operators", None, None),
            ("operator", "operator", None, None),
            ("status", "status", 1000, None),
            ("multiple_operators", "multiple operator", None, None),
            ("facility_designated_operations", "facility designated operation timeline", None, None),
            ("designated_operators", "operation designated operator timeline", None, None),
            ("facilities", "facility", None, None),
            ("report", "report", None, None),
            ("registration_purpose", "registration purpose", 1000, None),
            ("opted_in_operation", "opted in operation", None, None),
            ("transfer_events", "transfer event", None, None),
            ("transfer_events", "transfer event", None, None),
            ("restart_events", "restart event", None, None),
            ("closure_events", "closure event", None, None),
            ("temporary_shutdown_events", "temporary shutdown event", None, None),
            ("contacts", "contacts", None, None),
            ("date_of_first_shipment", "date of first shipment", 1000, None),
            ("status", "status", 1000, None),
        ]

    def test_unique_boro_id_per_operation(self):
        boro_id_instance = baker.make(BcObpsRegulatedOperation, id='22-0001')
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
        existing_id = baker.make(BcObpsRegulatedOperation, id='22-0001')  # Example existing ID for the current year
        self.test_object.bc_obps_regulated_operation = existing_id
        cas_director = baker.make_recipe('registration.tests.utils.cas_director')
        self.test_object.generate_unique_boro_id(user_guid=cas_director.user_guid)
        self.assertEqual(
            self.test_object.bc_obps_regulated_operation, existing_id, "Should not change the existing ID."
        )

    def test_generate_unique_boro_id_no_existing_id(self):
        # Case: No existing BORO ID
        self.test_object.bc_obps_regulated_operation = None
        cas_director = baker.make_recipe('registration.tests.utils.cas_director')
        self.test_object.generate_unique_boro_id(user_guid=cas_director.user_guid)
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
        cas_director = baker.make_recipe('registration.tests.utils.cas_director')
        self.test_object.generate_unique_boro_id(user_guid=cas_director.user_guid)
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
        cas_director = baker.make_recipe('registration.tests.utils.cas_director')
        self.test_object.generate_unique_boro_id(user_guid=cas_director.user_guid)
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

    # More general BCGHG ID generation tests are in test_utils
    def test_generate_unique_bcghg_id_multiple_existing_ids(self):
        existing_ids = ['13221210001', '13221210002', '13221210003', '23221210001', '23221210002', '14862100001']
        for existing_id in existing_ids:
            baker.make_recipe(
                'registration.tests.utils.operation', bcghg_id=baker.make(BcGreenhouseGasId, id=existing_id)
            )

        self.test_object.bcghg_id = None
        self.test_object.type = Operation.Types.SFO
        self.test_object.naics_code = baker.make(NaicsCode, naics_code='322121')
        cas_director = baker.make_recipe('registration.tests.utils.cas_director')
        self.test_object.generate_unique_bcghg_id(user_guid=cas_director.user_guid)
        expected_id = '13221210004'
        assert self.test_object.bcghg_id.pk == expected_id

    def test_user_has_access_to_operation(self):
        random_user_operator = baker.make_recipe('registration.tests.utils.user_operator')
        operation_for_random_user_operator = baker.make_recipe(
            'registration.tests.utils.operation', operator=random_user_operator.operator
        )
        approved_user_operator = baker.make_recipe(
            'registration.tests.utils.approved_user_operator', user=User.objects.first()
        )

        operation_for_approved_user_operator = baker.make_recipe(
            'registration.tests.utils.operation', operator=approved_user_operator.operator
        )
        self.assertFalse(
            operation_for_random_user_operator.user_has_access(approved_user_operator.user.user_guid),
            "There is no approved user-operator association.",
        )
        self.assertTrue(
            operation_for_approved_user_operator.user_has_access(approved_user_operator.user.user_guid),
            "There is an approved user-operator association.",
        )
