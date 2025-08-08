import logging
from datetime import datetime, timedelta
from typing import Optional
from django.db import models
from django.utils import timezone
from .task import Task

logger = logging.getLogger(__name__)


class RetryTask(Task):
    """Model for retry tasks that are created when functions fail."""

    max_retries = models.PositiveIntegerField(default=3, help_text="Maximum number of retry attempts")
    retry_count = models.PositiveIntegerField(default=0, help_text="Current retry attempt number")
    retry_delay_minutes = models.PositiveIntegerField(default=5, help_text="Delay in minutes between retry attempts")

    class Meta:
        db_table = 'common"."retry_task'
        db_table_comment = "Retry tasks created when functions fail"
        indexes = [
            models.Index(fields=['status', 'next_run_time']),
            models.Index(fields=['tag', 'status']),
        ]

    def __str__(self) -> str:
        status_display = dict(self.Status.choices)[self.status]
        return f"{self.function_path} (retry {self.retry_count}/{self.max_retries}) - {status_display}"

    @property
    def can_retry(self) -> bool:
        """Check if this task can be retried."""
        return self.retry_count < self.max_retries

    def calculate_next_run_time(self) -> Optional[datetime]:
        """Calculate next run time for retry tasks."""
        if not self.can_retry:
            return None
        return timezone.now() + timedelta(minutes=self.retry_delay_minutes)

    def mark_attempt_failed(self, error_message: str) -> None:
        """Mark that a task execution attempt failed and increment retry count."""
        super().mark_attempt_failed(error_message)
        if self.can_retry:
            self.retry_count += 1
            self.save(update_fields=['retry_count'])
