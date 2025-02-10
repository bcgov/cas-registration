from common.tests.utils.helpers import BaseTestCase
from model_bakery import baker
from registration.tests.constants import (
    TIMESTAMP_COMMON_FIELDS,
)


class OperationDesignatedOperatorTimelineModelTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        cls.test_object = baker.make_recipe('registration.tests.utils.operation_designated_operator_timeline')
        cls.field_data = [
            *TIMESTAMP_COMMON_FIELDS,
            ("id", "ID", None, None),
            ("operation", "operation", None, None),
            ("operator", "operator", None, None),
            ("start_date", "start date", None, None),
            ("end_date", "end date", None, None),
            ("status", "status", 1000, None),
        ]
