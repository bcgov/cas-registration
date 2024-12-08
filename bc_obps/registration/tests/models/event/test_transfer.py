from model_bakery import baker

from registration.models import TransferEvent, Operator, Operation
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
            ("operation", "operation", None, None),
            ("facilities", "facilities", None, None),
            ("from_operator", "from operator", None, None),
            ("to_operator", "to operator", None, None),
            ("from_operation", "from operation", None, None),
            ("to_operation", "to operation", None, None),
        ]
        cls.from_operator: Operator = baker.make_recipe('utils.operator')
        cls.to_operator: Operator = baker.make_recipe('utils.operator')
        cls.from_operation: Operation = baker.make_recipe('utils.operation')
        cls.to_operation: Operation = baker.make_recipe('utils.operation')
        super().setUpTestData()

    def test_event_with_operation_only(self):
        self.create_event_with_operation_only(
            from_operator=self.from_operator,
            to_operator=self.to_operator,
        )

    def test_event_with_facilities_only(self):
        self.create_event_with_facilities_only(
            from_operator=self.from_operator,
            to_operator=self.to_operator,
            from_operation=self.from_operation,
            to_operation=self.to_operation,
        )

    def test_event_with_operation_and_adding_facilities_raises_error(self):
        self.create_event_with_operation_and_adding_facilities_raises_error(
            from_operator=self.from_operator,
            to_operator=self.to_operator,
        )

    def test_event_with_facilities_and_adding_operation_raises_error(self):
        self.create_event_with_facilities_and_adding_operation_raises_error(
            from_operator=self.from_operator,
            to_operator=self.to_operator,
            from_operation=self.from_operation,
            to_operation=self.to_operation,
        )
