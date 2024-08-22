from common.tests.utils.helpers import BaseTestCase
from registration.models import Restart
from registration.tests.constants import (
    TIMESTAMP_COMMON_FIELDS,
    OPERATOR_FIXTURE,
    USER_FIXTURE,
    OPERATION_FIXTURE,
    CONTACT_FIXTURE,
    RESTART_FIXTURE,
)


class RestartModelTest(BaseTestCase):
    fixtures = [USER_FIXTURE, OPERATOR_FIXTURE, OPERATION_FIXTURE, CONTACT_FIXTURE, RESTART_FIXTURE]

    @classmethod
    def setUpTestData(cls):
        # operator = Operator.objects.get(legal_name="Existing Operator 2 Legal Name")
        # operation = Operation.objects.get(operator=operator)
        # cls.test_object = Restart.objects.create(operation=operation)
        cls.test_object = Restart.objects.first()
        cls.field_data = [
            *TIMESTAMP_COMMON_FIELDS,
            ("effective_date", "effective date", None, None),
            ("status", "status", 100, None),
            ("operation", "operation", None, 1),
            ("facilities", "facility", None, None),
        ]
