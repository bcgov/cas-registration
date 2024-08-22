from common.tests.utils.helpers import BaseTestCase
from registration.models import TemporaryShutdown
from registration.tests.constants import (
    TIMESTAMP_COMMON_FIELDS,
    ADDRESS_FIXTURE,
    BC_OBPS_REGULATED_OPERATION_FIXTURE,
    OPERATOR_FIXTURE,
    USER_FIXTURE,
    OPERATION_FIXTURE,
    CONTACT_FIXTURE,
    FACILITY_FIXTURE,
    TEMPORARY_SHUTDOWN_FIXTURE,
)


class TemporaryShutdownModelTest(BaseTestCase):
    fixtures = [
        USER_FIXTURE,
        ADDRESS_FIXTURE,
        CONTACT_FIXTURE,
        OPERATOR_FIXTURE,
        BC_OBPS_REGULATED_OPERATION_FIXTURE,
        OPERATION_FIXTURE,
        FACILITY_FIXTURE,
        TEMPORARY_SHUTDOWN_FIXTURE,
    ]

    @classmethod
    def setUpTestData(cls):
        cls.test_object = TemporaryShutdown.objects.first()
        cls.field_data = [
            *TIMESTAMP_COMMON_FIELDS,
            ("id", "id", None, None),
            ("effective_date", "effective date", None, None),
            ("status", "status", 100, None),
            ("description", "description", None, None),
            ("operation", "operation", None, None),
            ("facilities", "facilities", None, None),
        ]
