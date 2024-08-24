from common.tests.utils.helpers import BaseTestCase
from django.core.exceptions import ValidationError
from registration.models import Operation, Facility
from registration.tests.utils.bakers import facility_baker, operation_baker


class EventBaseModelMixin(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        cls.operation: Operation = operation_baker()
        cls.facility1: Facility = facility_baker()
        cls.facility2: Facility = facility_baker()

    def create_event_with_operation_only(self, *args, **kwargs):
        event = self.model.objects.create(
            operation=self.operation,
            effective_date="2024-01-01 00:00:00",
            *args,
            **kwargs
        )
        self.assertIsNotNone(event)

    def create_event_with_facilities_only(self, *args, **kwargs):
        event = self.model.objects.create(
            effective_date="2024-01-01 00:00:00",
            *args,
            **kwargs
        )
        event.facilities.set([self.facility1, self.facility2])
        self.assertIsNotNone(event)

    def create_event_with_operation_and_adding_facilities_raises_error(self, *args, **kwargs):
        with self.assertRaises(ValidationError, msg="An event must have either an operation or facilities, but not both."):
            event = self.model.objects.create(
                operation=self.operation,
                effective_date="2024-01-01 00:00:00",
                *args,
                **kwargs
            )
            event.facilities.set([self.facility1])

    def create_event_with_facilities_and_adding_operation_raises_error(self, *args, **kwargs):
        with self.assertRaises(ValidationError, msg="An event must have either an operation or facilities, but not both."):
            event = self.model.objects.create(
                effective_date="2024-01-01 00:00:00",
                *args,
                **kwargs
            )
            event.facilities.set([self.facility1, self.facility2])
            event.operation = self.operation
            event.save()
