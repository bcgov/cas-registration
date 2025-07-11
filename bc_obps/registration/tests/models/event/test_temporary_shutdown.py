from registration.models import TemporaryShutdownEvent
from registration.tests.constants import (
    TIMESTAMP_COMMON_FIELDS,
    ADDRESS_FIXTURE,
    BC_OBPS_REGULATED_OPERATION_FIXTURE,
    BC_GREENHOUSE_GAS_ID_FIXTURE,
    OPERATOR_FIXTURE,
    USER_FIXTURE,
    OPERATION_FIXTURE,
    CONTACT_FIXTURE,
    WELL_AUTHORIZATION_NUMBER_FIXTURE,
    FACILITY_FIXTURE,
    TEMPORARY_SHUTDOWN_EVENT_FIXTURE,
)
from registration.tests.models.event.event_base_model_mixin import EventBaseModelMixin


class TemporaryShutdownEventModelTest(EventBaseModelMixin):
    model = TemporaryShutdownEvent
    fixtures = [
        USER_FIXTURE,
        ADDRESS_FIXTURE,
        CONTACT_FIXTURE,
        OPERATOR_FIXTURE,
        BC_OBPS_REGULATED_OPERATION_FIXTURE,
        BC_GREENHOUSE_GAS_ID_FIXTURE,
        OPERATION_FIXTURE,
        WELL_AUTHORIZATION_NUMBER_FIXTURE,
        FACILITY_FIXTURE,
        TEMPORARY_SHUTDOWN_EVENT_FIXTURE,
    ]

    @classmethod
    def setUpTestData(cls):
        cls.test_object = cls.model.objects.first()
        cls.field_data = [
            *TIMESTAMP_COMMON_FIELDS,
            ("id", "id", None, None),
            ("effective_date", "effective date", None, None),
            ("status", "status", 100, None),
            ("description", "description", None, None),
            ("operation", "operation", None, None),
            ("facilities", "facilities", None, None),
        ]
        super().setUpTestData()

    def test_event_with_operation_only(self):
        self.create_event_with_operation_only()

    def test_event_with_facilities_only(self):
        self.create_event_with_facilities_only()

    def test_event_with_operation_and_adding_facilities_raises_error(self):
        self.create_event_with_operation_and_adding_facilities_raises_error()

    def test_event_with_facilities_and_adding_operation_raises_error(self):
        self.create_event_with_facilities_and_adding_operation_raises_error()
