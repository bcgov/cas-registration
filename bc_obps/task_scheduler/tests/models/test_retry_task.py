from datetime import timedelta
from common.tests.utils.helpers import BaseTestCase
from task_scheduler.models import RetryTask
from model_bakery.baker import make_recipe
from django.utils import timezone


class RetryTaskTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        cls.test_object = make_recipe(
            "task_scheduler.tests.utils.retry_task",
            function_path="test.module.function",
            tag="test",
            kwargs={"key": "value"},
            max_retries=3,
            retry_delay_minutes=5,
        )
        cls.field_data = [
            ("id", "ID", None, None),
            ("function_path", "function path", None, None),
            ("kwargs", "kwargs", None, None),
            ("tag", "tag", None, None),
            ("status", "status", None, None),
            ("next_run_time", "next run time", None, None),
            ("last_run_time", "last run time", None, None),
            ("lock_acquired_at", "lock acquired at", None, None),
            ("created_at", "created at", None, None),
            ("error_history", "error history", None, None),
            ("max_retries", "max retries", None, None),
            ("retry_count", "retry count", None, None),
            ("retry_delay_minutes", "retry delay minutes", None, None),
        ]

    def test_retry_task_can_retry_property(self):
        assert self.test_object.can_retry is True

        # Test when retry_count equals max_retries
        self.test_object.retry_count = 3
        self.test_object.save()
        assert self.test_object.can_retry is False

        # Test when retry_count exceeds max_retries
        self.test_object.retry_count = 4
        self.test_object.save()
        assert self.test_object.can_retry is False

    def test_retry_task_calculate_next_run_time_can_retry(self):
        now = timezone.now()
        next_run = self.test_object.calculate_next_run_time()

        assert next_run is not None
        assert next_run > now
        assert next_run <= now + timedelta(minutes=6)  # Should be within 5 minutes

    def test_retry_task_calculate_next_run_time_cannot_retry(self):
        self.test_object.retry_count = 3
        self.test_object.save()

        next_run = self.test_object.calculate_next_run_time()
        assert next_run is None

    def test_retry_task_mark_attempt_failed_increments_retry_count(self):
        self.test_object.status = RetryTask.Status.RUNNING
        self.test_object.save()

        error_message = "Test error"
        self.test_object.mark_attempt_failed(error_message)
        self.test_object.refresh_from_db()

        assert self.test_object.status == RetryTask.Status.FAILED
        assert self.test_object.retry_count == 1
        assert len(self.test_object.error_history) == 1
        assert self.test_object.error_history[0]['error'] == error_message
        assert 'timestamp' in self.test_object.error_history[0]

    def test_retry_task_mark_attempt_failed_multiple_times(self):
        self.test_object.status = RetryTask.Status.RUNNING
        self.test_object.save()

        # First failure
        self.test_object.mark_attempt_failed("Error 1")
        self.test_object.refresh_from_db()
        assert self.test_object.retry_count == 1
        assert len(self.test_object.error_history) == 1

        # Second failure
        self.test_object.status = RetryTask.Status.RUNNING
        self.test_object.save()
        self.test_object.mark_attempt_failed("Error 2")
        self.test_object.refresh_from_db()
        assert self.test_object.retry_count == 2
        assert len(self.test_object.error_history) == 2

        # Third failure
        self.test_object.status = RetryTask.Status.RUNNING
        self.test_object.save()
        self.test_object.mark_attempt_failed("Error 3")
        self.test_object.refresh_from_db()
        assert self.test_object.retry_count == 3
        assert len(self.test_object.error_history) == 3

        # Fourth failure (should not increment beyond max_retries)
        self.test_object.status = RetryTask.Status.RUNNING
        self.test_object.save()
        self.test_object.mark_attempt_failed("Error 4")
        self.test_object.refresh_from_db()
        assert self.test_object.retry_count == 3  # Should not exceed max_retries
        assert len(self.test_object.error_history) == 4

    def test_retry_task_error_history_limit(self):
        self.test_object.status = RetryTask.Status.RUNNING
        self.test_object.save()

        # Add 6 errors
        for i in range(6):
            self.test_object.status = RetryTask.Status.RUNNING
            self.test_object.save()
            self.test_object.mark_attempt_failed(f"Error {i}")

        self.test_object.refresh_from_db()

        # Should only keep last 5
        assert len(self.test_object.error_history) == 5
        assert self.test_object.error_history[0]['error'] == "Error 1"  # First error was removed
        assert self.test_object.error_history[4]['error'] == "Error 5"  # Last error is kept

    def test_retry_task_error_history_structure(self):
        self.test_object.status = RetryTask.Status.RUNNING
        self.test_object.save()

        error_message = "Test error message"
        self.test_object.mark_attempt_failed(error_message)
        self.test_object.refresh_from_db()

        assert len(self.test_object.error_history) == 1
        error_entry = self.test_object.error_history[0]
        assert 'error' in error_entry
        assert 'timestamp' in error_entry
        assert error_entry['error'] == error_message
        assert isinstance(error_entry['timestamp'], str)  # ISO format timestamp

    def test_retry_task_mark_attempt_started(self):
        self.test_object.mark_attempt_started()
        self.test_object.refresh_from_db()

        assert self.test_object.status == RetryTask.Status.RUNNING
        assert self.test_object.last_run_time is not None

    def test_retry_task_mark_attempt_success(self):
        self.test_object.status = RetryTask.Status.RUNNING
        self.test_object.lock_acquired_at = timezone.now()
        self.test_object.error_history = [{"error": "Previous error", "timestamp": "2024-01-01T10:00:00"}]
        self.test_object.save()

        self.test_object.mark_attempt_success()
        self.test_object.refresh_from_db()

        assert self.test_object.status == RetryTask.Status.COMPLETED
        assert self.test_object.error_history == [{"error": "Previous error", "timestamp": "2024-01-01T10:00:00"}]
        assert self.test_object.lock_acquired_at is None

    @staticmethod
    def test_retry_task_default_values():
        task = make_recipe(
            "task_scheduler.tests.utils.retry_task",
            function_path="test.module.function",
            tag="test",
            kwargs={},
        )

        assert task.max_retries == 3
        assert task.retry_delay_minutes == 5
        assert task.retry_count == 0

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
