from datetime import timedelta
from common.tests.utils.helpers import BaseTestCase
from task_scheduler.models import ScheduledTask
from model_bakery.baker import make_recipe
from django.utils import timezone


class TestScheduledTask(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        cls.test_object = make_recipe(
            "task_scheduler.tests.utils.scheduled_task",
            function_path="test.module.function",
            tag="test",
            next_run_time=timezone.now() - timedelta(minutes=1),
        )
        cls.field_data = [
            ("id", "ID", None, None),
            ("function_path", "function path", None, None),
            ("tag", "tag", None, None),
            ("status", "status", None, None),
            ("schedule_type", "schedule type", None, None),
            ("schedule_interval", "schedule interval", None, None),
            ("schedule_hour", "schedule hour", None, None),
            ("schedule_minute", "schedule minute", None, None),
            ("schedule_day_of_week", "schedule day of week", None, None),
            ("schedule_day_of_month", "schedule day of month", None, None),
            ("schedule_month", "schedule month", None, None),
            ("next_run_time", "next run time", None, None),
            ("last_run_time", "last run time", None, None),
            ("lock_acquired_at", "lock acquired at", None, None),
            ("created_at", "created at", None, None),
            ("error_history", "error history", None, None),
        ]

    def test_scheduled_task_calculate_next_run_time(self):
        # Test minutes schedule type
        self.test_object.schedule_type = ScheduledTask.ScheduleType.MINUTES
        self.test_object.schedule_interval = 30
        self.test_object.save()
        self.test_object.refresh_from_db()

        next_run = self.test_object.calculate_next_run_time()
        now = timezone.now()

        # Check that next_run is approximately 30 minutes from now
        time_diff = (next_run - now).total_seconds()
        self.assertAlmostEqual(time_diff, 30 * 60, delta=10)  # 10 seconds tolerance

        # Test hourly schedule type
        self.test_object.schedule_type = ScheduledTask.ScheduleType.HOURLY
        self.test_object.schedule_interval = 2
        self.test_object.save()
        self.test_object.refresh_from_db()
        next_run = self.test_object.calculate_next_run_time()
        now = timezone.now()

        # Check that next_run is approximately 2 hours from now
        time_diff = (next_run - now).total_seconds()
        self.assertAlmostEqual(time_diff, 2 * 60 * 60, delta=10)  # 10 seconds tolerance

        # Test daily schedule type
        self.test_object.schedule_type = ScheduledTask.ScheduleType.DAILY
        self.test_object.schedule_hour = 10
        self.test_object.schedule_minute = 30
        self.test_object.save()
        self.test_object.refresh_from_db()
        next_run = self.test_object.calculate_next_run_time()

        # Verify that the method returns a time with correct hour and minute
        self.assertIsNotNone(next_run)
        self.assertEqual(next_run.hour, 10)
        self.assertEqual(next_run.minute, 30)

        # Test weekly schedule type
        self.test_object.schedule_type = ScheduledTask.ScheduleType.WEEKLY
        self.test_object.schedule_hour = 9
        self.test_object.schedule_minute = 0
        self.test_object.schedule_day_of_week = 1  # Monday
        self.test_object.save()
        self.test_object.refresh_from_db()
        next_run = self.test_object.calculate_next_run_time()

        # Verify that the method returns a time with correct weekday, hour and minute
        self.assertIsNotNone(next_run)
        self.assertEqual(next_run.weekday(), 1)  # Monday
        self.assertEqual(next_run.hour, 9)
        self.assertEqual(next_run.minute, 0)

        # Test monthly schedule type
        self.test_object.schedule_type = ScheduledTask.ScheduleType.MONTHLY
        self.test_object.schedule_day_of_month = 15
        self.test_object.schedule_hour = 14
        self.test_object.schedule_minute = 45
        self.test_object.save()
        self.test_object.refresh_from_db()
        next_run = self.test_object.calculate_next_run_time()

        # Verify that the method returns a time with correct day, hour and minute
        self.assertIsNotNone(next_run)
        self.assertEqual(next_run.day, 15)
        self.assertEqual(next_run.hour, 14)
        self.assertEqual(next_run.minute, 45)

        # Test yearly schedule type
        self.test_object.schedule_type = ScheduledTask.ScheduleType.YEARLY
        self.test_object.schedule_month = 6  # June
        self.test_object.schedule_day_of_month = 15
        self.test_object.schedule_hour = 14
        self.test_object.schedule_minute = 45
        self.test_object.save()
        self.test_object.refresh_from_db()
        next_run = self.test_object.calculate_next_run_time()

        # Verify that the method returns a time with correct month, day, hour and minute
        self.assertIsNotNone(next_run)
        self.assertEqual(next_run.month, 6)  # June
        self.assertEqual(next_run.day, 15)
        self.assertEqual(next_run.hour, 14)
        self.assertEqual(next_run.minute, 45)

    def test_acquire_lock_success(self):
        assert self.test_object.acquire_lock() is True
        self.test_object.refresh_from_db()
        assert self.test_object.lock_acquired_at is not None

    def test_acquire_lock_already_locked(self):
        # Acquire lock first time
        assert self.test_object.acquire_lock() is True

        # Try to acquire lock again
        assert self.test_object.acquire_lock() is False

    def test_acquire_lock_expired_lock(self):
        # Set an expired lock
        self.test_object.lock_acquired_at = timezone.now() - timedelta(minutes=70)  # Expired
        self.test_object.save()

        # Should be able to acquire new lock
        assert self.test_object.acquire_lock() is True
        self.test_object.refresh_from_db()
        assert self.test_object.lock_acquired_at is not None

    def test_release_lock(self):
        # Acquire lock first
        self.test_object.acquire_lock()
        self.test_object.refresh_from_db()
        assert self.test_object.lock_acquired_at is not None

        # Release lock
        self.test_object.release_lock()
        self.test_object.refresh_from_db()
        assert self.test_object.lock_acquired_at is None

    def test_audit_column_triggers(self):
        # This data model has created_at field, but it does not have triggers set up because it is not a timestamped model
        # Therefore, we override the base test to do nothing
        pass
