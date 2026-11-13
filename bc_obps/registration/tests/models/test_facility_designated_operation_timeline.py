from common.tests.utils.helpers import BaseTestCase
from model_bakery.baker import make_recipe
from registration.tests.constants import (
    TIMESTAMP_COMMON_FIELDS,
)


class FacilityDesignatedOperationTimelineModelTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        cls.test_object = make_recipe('registration.tests.utils.facility_designated_operation_timeline')
        cls.field_data = [
            *TIMESTAMP_COMMON_FIELDS,
            ("id", "ID", None, None),
            ("operation", "operation", None, None),
            ("facility", "facility", None, None),
            ("start_date", "start date", None, None),
            ("end_date", "end date", None, None),
        ]
