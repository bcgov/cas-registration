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
            ("well_authorization_numbers", "well authorization number", None, None),
            ("swrs_facility_id", "swrs facility id", None, None),
            ("bcghg_id", "bcghg id", None, None),
            ("ownerships", "facility ownership timeline", None, None),
            ("events", "event", None, None),
        ]
