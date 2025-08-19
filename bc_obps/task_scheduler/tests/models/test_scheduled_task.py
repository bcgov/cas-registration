from datetime import timedelta
from common.tests.utils.helpers import BaseTestCase
from task_scheduler.models import ScheduledTask
from model_bakery.baker import make_recipe
from django.utils import timezone
from unittest.mock import patch
from zoneinfo import ZoneInfo


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

    def _test_schedule_time(self, schedule_type, hour, minute, verify_utc=True, **kwargs):
        """Helper method to test schedule with timezone conversion.

        Args:
            schedule_type: The schedule type to test
            hour: Expected hour in local timezone
            minute: Expected minute in local timezone
            verify_utc: Whether to verify UTC timezone and UTC vs local time difference
            **kwargs: Additional schedule parameters to set
        """
        self.test_object.schedule_type = schedule_type
        self.test_object.schedule_hour = hour
        self.test_object.schedule_minute = minute

        # Set additional schedule parameters if provided
        for key, value in kwargs.items():
            setattr(self.test_object, key, value)

        self.test_object.save()
        self.test_object.refresh_from_db()

        next_run = self.test_object.calculate_next_run_time()
        self.assertIsNotNone(next_run)

        if verify_utc:
            self.assertEqual(next_run.tzinfo, ZoneInfo("UTC"))
            # Verify UTC time is different from local time
            self.assertNotEqual(next_run.hour, hour)

        # Convert UTC time to Vancouver time to verify the scheduled time
        vancouver_time = next_run.astimezone(ZoneInfo("America/Vancouver"))
        self.assertEqual(vancouver_time.hour, hour)
        self.assertEqual(vancouver_time.minute, minute)

        return next_run

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
        self._test_schedule_time(ScheduledTask.ScheduleType.DAILY, 10, 30, verify_utc=False)

        # Test weekly schedule type
        next_run = self._test_schedule_time(
            ScheduledTask.ScheduleType.WEEKLY, 9, 0, verify_utc=False, schedule_day_of_week=1
        )  # Monday
        self.assertEqual(next_run.astimezone(ZoneInfo("America/Vancouver")).weekday(), 1)

        # Test monthly schedule type
        next_run = self._test_schedule_time(
            ScheduledTask.ScheduleType.MONTHLY, 14, 45, verify_utc=False, schedule_day_of_month=15
        )
        self.assertEqual(next_run.day, 15)

        # Test yearly schedule type
        next_run = self._test_schedule_time(
            ScheduledTask.ScheduleType.YEARLY, 14, 45, verify_utc=False, schedule_day_of_month=15, schedule_month=6
        )
        self.assertEqual(next_run.month, 6)  # June
        self.assertEqual(next_run.day, 15)

    def test_timezone_conversion_works_correctly(self):
        """Comprehensive test for timezone conversion functionality."""

        # Test Vancouver timezone (default)
        with patch('task_scheduler.config.settings.TASK_SCHEDULER_CONFIG', {'timezone': 'America/Vancouver'}):
            # Test basic daily schedule conversion
            self._test_schedule_time(ScheduledTask.ScheduleType.DAILY, 14, 30, verify_utc=True)

            # Test weekly schedule
            next_run = self._test_schedule_time(
                ScheduledTask.ScheduleType.WEEKLY, 9, 15, verify_utc=True, schedule_day_of_week=2
            )  # Tuesday
            self.assertEqual(next_run.astimezone(ZoneInfo("America/Vancouver")).weekday(), 2)

            # Test edge cases
            self._test_schedule_time(ScheduledTask.ScheduleType.DAILY, 0, 0, verify_utc=True)  # midnight
            self._test_schedule_time(ScheduledTask.ScheduleType.DAILY, 23, 59, verify_utc=True)  # late night

            # Test future calculation caching
            first_run = self._test_schedule_time(ScheduledTask.ScheduleType.DAILY, 8, 0, verify_utc=True)

            # Second calculation should use stored UTC time if it's in the future
            second_run = self.test_object.calculate_next_run_time()
            self.assertEqual(first_run, second_run)

        # Test different timezone configuration
        with patch('task_scheduler.config.settings.TASK_SCHEDULER_CONFIG', {'timezone': 'America/New_York'}):
            self.test_object.schedule_type = ScheduledTask.ScheduleType.DAILY
            self.test_object.schedule_hour = 12
            self.test_object.schedule_minute = 0
            self.test_object.save()

            next_run = self.test_object.calculate_next_run_time()
            self.assertIsNotNone(next_run)
            self.assertEqual(next_run.tzinfo, ZoneInfo("UTC"))

            ny_tz = ZoneInfo("America/New_York")
            ny_time = next_run.astimezone(ny_tz)

            # Verify that timezone conversion was applied
            self.assertIsNotNone(ny_time)

            # Verify the time is stored in UTC (should be different from local time due to timezone offset)
            self.assertNotEqual(next_run.hour, 12)  # UTC should be different from local time

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
