from itertools import cycle
from django.db.utils import ProgrammingError
from common.tests.utils.helpers import BaseTestCase
from common.lib import pgtrigger
from registration.models import Facility, Operation
from model_bakery import baker
from registration.tests.constants import (
    ADDRESS_FIXTURE,
    BC_OBPS_REGULATED_OPERATION_FIXTURE,
    BC_GREENHOUSE_GAS_ID_FIXTURE,
    CONTACT_FIXTURE,
    DOCUMENT_FIXTURE,
    WELL_AUTHORIZATION_NUMBER_FIXTURE,
    FACILITY_FIXTURE,
    OPERATION_FIXTURE,
    OPERATOR_FIXTURE,
    TIMESTAMP_COMMON_FIELDS,
    USER_FIXTURE,
)


class FacilityModelTest(BaseTestCase):
    fixtures = [
        ADDRESS_FIXTURE,
        USER_FIXTURE,
        CONTACT_FIXTURE,
        OPERATOR_FIXTURE,
        OPERATION_FIXTURE,
        DOCUMENT_FIXTURE,
        BC_OBPS_REGULATED_OPERATION_FIXTURE,
        BC_GREENHOUSE_GAS_ID_FIXTURE,
        WELL_AUTHORIZATION_NUMBER_FIXTURE,
        FACILITY_FIXTURE,
    ]

    @classmethod
    def setUpTestData(cls):
        cls.test_object = Facility.objects.first()
        cls.field_data = [
            *TIMESTAMP_COMMON_FIELDS,
            ("id", "ID", None, None),
            ("name", "name", 1000, None),
            ("type", "type", 100, None),
            ("address", "address", None, None),
            ("latitude_of_largest_emissions", "latitude of largest emissions", None, None),
            ("longitude_of_largest_emissions", "longitude of largest emissions", None, None),
            ("well_authorization_numbers", "well authorization numbers", None, None),
            ("swrs_facility_id", "swrs facility id", None, None),
            ("bcghg_id", "bcghg id", None, None),
            ("designated_operations", "facility designated operation timeline", None, None),
            ("operation", "operation", None, None),
            ("is_current_year", "is current year", None, None),
            ("starting_date", "starting date", None, None),
            ("facility_reports", "facility report", None, 0),
            ("transfer_events", "transfer event", None, None),
            ("restart_events", "restart event", None, None),
            ("closure_events", "closure event", None, None),
            ("temporary_shutdown_events", "temporary shutdown event", None, None),
        ]


class FacilityTriggerTests(BaseTestCase):
    def setUp(self):
        self.registered_operation = baker.make_recipe(
            "registration.tests.utils.operation", status=Operation.Statuses.REGISTERED
        )
        self.non_registered_operation = baker.make_recipe(
            "registration.tests.utils.operation",
            status=cycle([Operation.Statuses.DRAFT, Operation.Statuses.NOT_STARTED, Operation.Statuses.DECLINED]),
        )
        self.facility_with_registered_op = baker.make_recipe(
            "registration.tests.utils.facility", operation=self.registered_operation
        )
        self.facility_with_non_registered_op = baker.make_recipe(
            "registration.tests.utils.facility", operation=self.non_registered_operation
        )

    def test_insert_null_bcghg_id_any_operation_status(self):
        # Test that a Facility can be created with null bcghg_id regardless of Operation status
        self.assertIsNone(self.facility_with_registered_op.bcghg_id)
        self.assertIsNone(self.facility_with_non_registered_op.bcghg_id)

    def test_insert_bcghg_id_with_non_registered_operation(self):
        # Test that setting bcghg_id fails if the related Operation isn't Registered
        with self.assertRaises(ProgrammingError) as cm:
            self.facility_with_non_registered_op.bcghg_id = baker.make_recipe("registration.tests.utils.bcghg_id")
            self.facility_with_non_registered_op.save()
        self.assertIn(
            "Cannot assign bcghg_id to Facility unless the related Operation status is Registered",
            str(cm.exception),
        )

    def test_insert_bcghg_id_with_registered_operation(self):
        # Test that setting bcghg_id succeeds if the related Operation is Registered
        self.facility_with_registered_op.bcghg_id = baker.make_recipe("registration.tests.utils.bcghg_id")
        self.facility_with_registered_op.save()
        self.assertIsNotNone(self.facility_with_registered_op.bcghg_id)

    def test_insert_new_facility_with_bcghg_id_and_non_registered_operation(self):
        # Test that creating a new Facility with bcghg_id and non-Registered Operation fails
        with self.assertRaises(ProgrammingError) as cm:
            baker.make_recipe(
                "registration.tests.utils.facility",
                operation=self.non_registered_operation,
                bcghg_id=baker.make_recipe("registration.tests.utils.bcghg_id"),
            )
        self.assertIn(
            "Cannot assign bcghg_id to Facility unless the related Operation status is Registered",
            str(cm.exception),
        )

    def test_change_operation_status_then_assign_bcghg_id(self):
        # Test that changing the Operation status to Registered allows assigning bcghg_id
        self.non_registered_operation.status = Operation.Statuses.REGISTERED
        self.non_registered_operation.save()
        self.facility_with_non_registered_op.bcghg_id = baker.make_recipe("registration.tests.utils.bcghg_id")
        self.facility_with_non_registered_op.save()
        self.assertIsNotNone(self.facility_with_non_registered_op.bcghg_id)

    def test_facility_with_preexisting_bcghg_id_allows_operation_registration(self):
        # If the facility already has a BCGHG ID because it was imported from SWRS, the user should be allowed to submit their operation registration

        # temporarily disable the trigger so that we can insert a mock facility into the test DB
        facility_bcghgid = baker.make_recipe("registration.tests.utils.bcghg_id")
        with pgtrigger.ignore("registration.Facility:restrict_bcghg_id_unless_operation_registered"):
            self.facility_with_non_registered_op.bcghg_id = facility_bcghgid
            self.facility_with_non_registered_op.save()

        self.facility_with_non_registered_op.operation.status = Operation.Statuses.REGISTERED
        self.facility_with_non_registered_op.save()

        assert self.facility_with_non_registered_op.operation.status == Operation.Statuses.REGISTERED
        assert self.facility_with_non_registered_op.bcghg_id == facility_bcghgid

    def test_facility_with_preexisting_bcghg_id_allows_facility_update(self):
        # If the facility already has a BCGHG ID because it was imported from SWRS, the user should be allowed to update the facility's information

        # temporarily disable the trigger so that we can insert a mock facility into the test DB
        facility_bcghgid = baker.make_recipe("registration.tests.utils.bcghg_id")
        with pgtrigger.ignore("registration.Facility:restrict_bcghg_id_unless_operation_registered"):
            self.facility_with_non_registered_op.bcghg_id = facility_bcghgid
            self.facility_with_non_registered_op.save()

        self.facility_with_non_registered_op.name = "Updated Facility Name"
        self.facility_with_non_registered_op.save()

        assert self.facility_with_non_registered_op.bcghg_id == facility_bcghgid
        assert self.facility_with_non_registered_op.name == "Updated Facility Name"
