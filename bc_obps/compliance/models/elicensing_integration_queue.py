from django.db import models
from compliance.models.compliance_obligation import ComplianceObligation
from .rls_configs.elicensing_integration_queue import Rls as ElicensingIntegrationQueueRls


class ElicensingIntegrationQueue(models.Model):

    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        PROCESSING = "PROCESSING", "Processing"
        COMPLETED = "COMPLETED", "Completed"
        FAILED = "FAILED", "Failed"
        MAX_RETRIES_EXCEEDED = "MAX_RETRIES_EXCEEDED", "Max Retries Exceeded"

    compliance_obligation = models.ForeignKey(
        ComplianceObligation,
        on_delete=models.CASCADE,
        related_name="elicensing_integration_queue_entries",
        db_comment="The compliance obligation that needs elicensing integration",
    )

    status = models.CharField(
        max_length=50,
        choices=Status.choices,
        default=Status.PENDING,
        db_comment="Current status of the integration task",
    )

    retry_count = models.IntegerField(
        default=0,
        db_comment="Number of times this task has been retried",
    )

    max_retries = models.IntegerField(
        default=5,
        db_comment="Maximum number of retry attempts allowed",
    )

    last_error_message = models.TextField(
        null=True,
        blank=True,
        db_comment="Error message from the last failed attempt",
    )

    next_retry_at = models.DateTimeField(
        null=True,
        blank=True,
        db_comment="When to retry this task next (for exponential backoff)",
    )

    completed_at = models.DateTimeField(
        null=True,
        blank=True,
        db_comment="When the integration was successfully completed",
    )

    class Meta:
        app_label = "compliance"
        db_table_comment = "Queue for tracking elicensing integration tasks that need processing or retry"
        db_table = 'erc"."elicensing_integration_queue'
        indexes = [
            models.Index(fields=['status', 'next_retry_at']),
            models.Index(fields=['compliance_obligation']),
        ]

    Rls = ElicensingIntegrationQueueRls

    def __str__(self) -> str:
        return f"Elicensing Integration Queue Entry {self.id} - Obligation {self.compliance_obligation_id} - Status {self.status}"

    @property
    def can_retry(self) -> bool:
        """Check if this task can be retried"""
        return self.status in [self.Status.FAILED, self.Status.PENDING] and self.retry_count < self.max_retries

    def mark_for_retry(self, error_message: str) -> None:
        """Mark this task for retry with exponential backoff"""
        self.status = self.Status.FAILED
        self.retry_count += 1
        self.last_error_message = error_message

        if self.retry_count >= self.max_retries:
            self.status = self.Status.MAX_RETRIES_EXCEEDED
        else:
            # Exponential backoff: 2^retry_count minutes, max 24 hours
            import math
            from django.utils import timezone
            from datetime import timedelta

            delay_minutes = min(2**self.retry_count, 1440)  # Max 24 hours
            self.next_retry_at = timezone.now() + timedelta(minutes=delay_minutes)

        self.save(update_fields=['status', 'retry_count', 'last_error_message', 'next_retry_at'])

    def mark_completed(self) -> None:
        """Mark this task as completed"""
        from django.utils import timezone

        self.status = self.Status.COMPLETED
        self.completed_at = timezone.now()
        self.save(update_fields=['status', 'completed_at'])

    def mark_processing(self) -> None:
        """Mark this task as currently being processed"""
        self.status = self.Status.PROCESSING
        self.save(update_fields=['status'])
