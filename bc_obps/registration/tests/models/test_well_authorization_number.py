from common.tests.utils.helpers import BaseTestCase
from registration.models import (
    WellAuthorizationNumber,
)
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


class WellAuthorizationNumberTest(BaseTestCase):
    fixtures = [
        ADDRESS_FIXTURE,
        USER_FIXTURE,
        CONTACT_FIXTURE,
        OPERATOR_FIXTURE,
        OPERATION_FIXTURE,
        DOCUMENT_FIXTURE,
        BC_OBPS_REGULATED_OPERATION_FIXTURE,
        BC_GREENHOUSE_GAS_ID_FIXTURE,
    ]

    @classmethod
    def setUpTestData(cls):
        cls.test_object = WellAuthorizationNumber.objects.create(well_authorization_number="1")
        cls.field_data = [
            *TIMESTAMP_COMMON_FIELDS,
            ("well_authorization_number", "well authorization number", None, None),
            ("facilities", "facility", None, None),
        ]
