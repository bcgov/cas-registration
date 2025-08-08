import logging
from datetime import datetime, timedelta
from typing import Optional
from django.db import models, transaction
from django.utils import timezone

logger = logging.getLogger(__name__)


class Task(models.Model):
    """Abstract base model for all tasks."""

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        RUNNING = "running", "Running"
        COMPLETED = "completed", "Completed"
        FAILED = "failed", "Failed"

    function_path = models.CharField(max_length=255, help_text="Full path to the function to execute")
    kwargs = models.JSONField(default=dict, help_text="Keyword arguments to pass to the function")
    tag = models.CharField(max_length=100, blank=True, help_text="Tag for categorizing and filtering tasks")
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.PENDING, help_text="Current status of the task"
    )
    next_run_time = models.DateTimeField(null=True, blank=True, help_text="When this task should run next")
    last_run_time = models.DateTimeField(null=True, blank=True, help_text="When this task was last executed")
    error_message = models.TextField(blank=True, help_text="Last error message if task failed")
    last_error_time = models.DateTimeField(null=True, blank=True, help_text="Time of last error")
    lock_acquired_at = models.DateTimeField(null=True, blank=True, help_text="When the lock was acquired")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        abstract = True

    def __str__(self) -> str:
        status_display = dict(self.Status.choices)[self.status]
        return f"{self.function_path} - {status_display}"

    def is_due_for_execution(self) -> bool:
        if self.status not in [self.Status.PENDING, self.Status.FAILED]:
            return False
        if not self.next_run_time:
            return False
        return timezone.now() >= self.next_run_time

    def acquire_lock(self) -> bool:
        with transaction.atomic():
            # Refresh from database to get latest state
            self.refresh_from_db()

            # Check if task is already locked and lock hasn't expired (30 minutes)
            if self.lock_acquired_at and self.lock_acquired_at > timezone.now() - timedelta(minutes=30):
                logger.debug(f"{self.__class__.__name__} {self.pk} is already locked")
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
        self.error_message = ""
        self.last_error_time = None
        self.lock_acquired_at = None
        self.save(update_fields=['status', 'error_message', 'last_error_time', 'lock_acquired_at'])

    def mark_attempt_failed(self, error_message: str) -> None:
        self.status = self.Status.FAILED
        self.error_message = error_message
        self.last_error_time = timezone.now()
        self.lock_acquired_at = None
        self.save(update_fields=['status', 'error_message', 'last_error_time', 'lock_acquired_at'])

    def calculate_next_run_time(self) -> Optional[datetime]:
        """Calculate the next run time. Override in subclasses."""
        raise NotImplementedError("Subclasses must implement calculate_next_run_time")
