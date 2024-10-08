from common.tests.utils.helpers import BaseTestCase
from registration.models import Facility
from registration.tests.constants import (
    ADDRESS_FIXTURE,
    BC_OBPS_REGULATED_OPERATION_FIXTURE,
    CONTACT_FIXTURE,
    DOCUMENT_FIXTURE,
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
            ("is_current_year", "is current year", None, None),
            ("starting_date", "starting date", None, None),
            ("facility_reports", "facility report", None, 0),
            ("transfer_events", "transfer event", None, None),
            ("restart_events", "restart event", None, None),
            ("closure_events", "closure event", None, None),
            ("temporary_shutdown_events", "temporary shutdown event", None, None),
        ]
