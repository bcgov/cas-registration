import logging
from datetime import datetime, timedelta
from typing import Optional
from django.db import models, transaction
from django.utils import timezone
from task_scheduler.config.settings import TASK_SCHEDULER_CONFIG

logger = logging.getLogger(__name__)


class Task(models.Model):
    """Abstract base model for all tasks."""

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        RUNNING = "running", "Running"
        COMPLETED = "completed", "Completed"
        FAILED = "failed", "Failed"
        INACTIVE = "inactive", "Inactive"  # For tasks no longer in use

    function_path = models.CharField(max_length=512, help_text="Full path to the function to execute")
    tag = models.CharField(max_length=100, blank=True, help_text="Tag for categorizing and filtering tasks")
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.PENDING, help_text="Current status of the task"
    )
    next_run_time = models.DateTimeField(null=True, blank=True, help_text="When this task should run next")
    last_run_time = models.DateTimeField(null=True, blank=True, help_text="When this task was last executed")
    lock_acquired_at = models.DateTimeField(null=True, blank=True, help_text="When the lock was acquired")
    created_at = models.DateTimeField(auto_now_add=True)
    error_history = models.JSONField(default=list, help_text="Last 5 error messages with timestamps")

    class Meta:
        abstract = True

    def acquire_lock(self) -> bool:
        with transaction.atomic():
            self.refresh_from_db()

            # Check if task is already locked and lock hasn't expired
            lock_timeout_minutes = TASK_SCHEDULER_CONFIG.get('lock_timeout_minutes', 10)
            if not isinstance(lock_timeout_minutes, int):
                lock_timeout_minutes = 10
            lock_timeout = timedelta(minutes=lock_timeout_minutes)
            if self.lock_acquired_at and self.lock_acquired_at > timezone.now() - lock_timeout:
                return False

            # Acquire the lock
            self.lock_acquired_at = timezone.now()
            self.save(update_fields=['lock_acquired_at'])
            logger.debug(f"Lock acquired for {self.__class__.__name__} {self.pk}")
            return True

    def release_lock(self) -> None:
        self.lock_acquired_at = None
        self.save(update_fields=['lock_acquired_at'])
        logger.debug(f"Lock released for {self.__class__.__name__} {self.pk}")

    def mark_attempt_started(self) -> None:
        self.status = self.Status.RUNNING
        self.last_run_time = timezone.now()
        self.save(update_fields=['status', 'last_run_time'])

    def mark_attempt_success(self) -> None:
        self.status = self.Status.COMPLETED
        self.lock_acquired_at = None
        self.save(update_fields=['status', 'lock_acquired_at'])

    def mark_attempt_failed(self, error_message: str) -> None:
        self.status = self.Status.FAILED
        self.lock_acquired_at = None
        error_entry: dict = {'error': error_message, 'timestamp': timezone.now().isoformat()}
        self.error_history.append(error_entry)
        if len(self.error_history) > 5:  # Keep only last 5
            self.error_history.pop(0)  # Remove oldest error

        self.save(update_fields=['status', 'lock_acquired_at', 'error_history'])

    def calculate_next_run_time(self, force_recalculate: bool = False, **kwargs: object) -> Optional[datetime]:
        raise NotImplementedError("Subclasses must implement calculate_next_run_time")
