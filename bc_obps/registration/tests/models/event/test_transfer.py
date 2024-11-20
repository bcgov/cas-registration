from registration.models import TransferEvent
from registration.tests.constants import (
    TIMESTAMP_COMMON_FIELDS,
    ADDRESS_FIXTURE,
    BC_OBPS_REGULATED_OPERATION_FIXTURE,
    BC_GREENHOUSE_GAS_ID_FIXTURE,
    OPERATOR_FIXTURE,
    USER_FIXTURE,
    OPERATION_FIXTURE,
    CONTACT_FIXTURE,
    FACILITY_FIXTURE,
    TRANSFER_EVENT_FIXTURE,
)
from registration.tests.models.event.event_base_model_mixin import EventBaseModelMixin
from registration.tests.utils.bakers import contact_baker, operator_baker


class TransferEventModelTest(EventBaseModelMixin):
    model = TransferEvent
    fixtures = [
        USER_FIXTURE,
        ADDRESS_FIXTURE,
        CONTACT_FIXTURE,
        OPERATOR_FIXTURE,
        BC_OBPS_REGULATED_OPERATION_FIXTURE,
        BC_GREENHOUSE_GAS_ID_FIXTURE,
        OPERATION_FIXTURE,
        FACILITY_FIXTURE,
        TRANSFER_EVENT_FIXTURE,
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
            ("other_operator", "other operator", None, None),
            ("other_operator_contact", "other operator contact", None, None),
        ]
        super().setUpTestData()

    def test_event_with_operation_only(self):
        self.create_event_with_operation_only(
            description="Why the transfer is happening",
            other_operator=operator_baker(),
            other_operator_contact=contact_baker(),
        )

    def test_event_with_facilities_only(self):
        self.create_event_with_facilities_only(
            description="Why the transfer is happening returns",
            other_operator=operator_baker(),
            other_operator_contact=contact_baker(),
        )

    def test_event_with_operation_and_adding_facilities_raises_error(self):
        self.create_event_with_operation_and_adding_facilities_raises_error()

    def test_event_with_facilities_and_adding_operation_raises_error(self):
        self.create_event_with_facilities_and_adding_operation_raises_error()
