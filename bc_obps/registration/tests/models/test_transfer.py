from common.tests.utils.helpers import BaseTestCase
from registration.models import TransferEvent
from registration.tests.constants import (
    TIMESTAMP_COMMON_FIELDS,
    ADDRESS_FIXTURE,
    BC_OBPS_REGULATED_OPERATION_FIXTURE,
    OPERATOR_FIXTURE,
    USER_FIXTURE,
    OPERATION_FIXTURE,
    CONTACT_FIXTURE,
    FACILITY_FIXTURE,
    TRANSFER_FIXTURE,
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
        TRANSFER_FIXTURE,
    ]

    @classmethod
    def setUpTestData(cls):
        cls.test_object = TransferEvent.objects.first()
        cls.field_data = [
            *TIMESTAMP_COMMON_FIELDS,
            ("id", "id", None, None),
            ("effective_date", "effective date", None, None),
            ("status", "status", 100, None),
            ("description", "description", None, None),
            ("operation", "operation", None, None),
            ("facilities", "facilities", None, None),
            ("other_operator", "other operator", None, None),
            ("other_operator_contact", "other operator contact", None, None),
            ("future_designated_operator", "future designated operator", None, None),
        ]
