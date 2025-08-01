from model_bakery import baker
from common.tests.utils.helpers import BaseTestCase
from django.core.exceptions import ValidationError
from registration.models import Operation, Facility
from django.utils import timezone


class EventBaseModelMixin(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        cls.operation: Operation = baker.make_recipe('registration.tests.utils.operation')
        cls.facility1: Facility = baker.make_recipe('registration.tests.utils.facility')
        cls.facility2: Facility = baker.make_recipe('registration.tests.utils.facility')

    def create_event_with_operation_only(self, *args, **kwargs):
        event = self.model.objects.create(operation=self.operation, effective_date=timezone.now(), *args, **kwargs)
        self.assertIsNotNone(event)

    def create_event_with_facilities_only(self, *args, **kwargs):
        event = self.model.objects.create(effective_date=timezone.now(), *args, **kwargs)
        event.facilities.set([self.facility1, self.facility2])
        self.assertIsNotNone(event)

    def create_event_with_operation_and_adding_facilities_raises_error(self, *args, **kwargs):
        with self.assertRaises(
            ValidationError, msg="An event must have either an operation or facilities, but not both."
        ):
            event = self.model.objects.create(effective_date=timezone.now(), operation=self.operation, *args, **kwargs)
            event.facilities.set([self.facility1])

    def create_event_with_facilities_and_adding_operation_raises_error(self, *args, **kwargs):
        with self.assertRaises(
            ValidationError, msg="An event must have either an operation or facilities, but not both."
        ):
            event = self.model.objects.create(effective_date=timezone.now(), *args, **kwargs)
            event.facilities.set([self.facility1, self.facility2])
            event.operation = self.operation
            event.save()
