import logging
from datetime import datetime, timedelta
from typing import Callable, Dict, Optional
from django.db import models
from django.utils import timezone
from .task import Task

logger = logging.getLogger(__name__)


class ScheduledTask(Task):
    """Model for scheduled tasks that run on a regular basis."""

    class ScheduleType(models.TextChoices):
        MINUTES = "minutes", "Every X Minutes"
        HOURLY = "hourly", "Every X Hours"
        DAILY = "daily", "Daily at Fixed Time"
        WEEKLY = "weekly", "Weekly on Specific Day"
        MONTHLY = "monthly", "Monthly on Specific Day"

    schedule_type = models.CharField(max_length=20, choices=ScheduleType.choices, help_text="Type of schedule")
    schedule_interval = models.PositiveIntegerField(
        null=True, blank=True, help_text="Interval for MINUTES/HOURLY schedules"
    )
    schedule_hour = models.PositiveIntegerField(null=True, blank=True, help_text="Hour (0-23) for fixed time")
    schedule_minute = models.PositiveIntegerField(null=True, blank=True, help_text="Minute (0-59) for fixed time")
    schedule_day_of_week = models.PositiveIntegerField(
        null=True, blank=True, help_text="Day of week (0=Monday, 6=Sunday)"
    )
    schedule_day_of_month = models.PositiveIntegerField(null=True, blank=True, help_text="Day of month (1-31)")

    class Meta:
        db_table = 'common"."scheduled_task'
        db_table_comment = "Scheduled tasks that run on a regular basis"
        indexes = [
            models.Index(fields=['status', 'next_run_time']),
            models.Index(fields=['tag', 'status']),
        ]

    def __str__(self) -> str:
        status_display = dict(self.Status.choices)[self.status]
        return f"{self.function_path} ({self.schedule_type}) - {status_display}"

    def calculate_next_run_time(self) -> Optional[datetime]:
        """Calculate the next run time based on schedule type."""
        if not self.schedule_type:
            return None
        now = timezone.now()
        schedule_calculators: Dict[str, Callable[[datetime], Optional[datetime]]] = {
            self.ScheduleType.MINUTES: self._calculate_minutes_schedule,
            self.ScheduleType.HOURLY: self._calculate_hourly_schedule,
            self.ScheduleType.DAILY: self._calculate_daily_schedule,
            self.ScheduleType.WEEKLY: self._calculate_weekly_schedule,
            self.ScheduleType.MONTHLY: self._calculate_monthly_schedule,
        }
        calculator = schedule_calculators.get(self.schedule_type)
        if calculator:
            return calculator(now)
        return None

    def _calculate_minutes_schedule(self, now: datetime) -> Optional[datetime]:
        """Calculate next run time for minutes schedule."""
        if not self.schedule_interval:
            return None
        if self.next_run_time and now < self.next_run_time:
            return self.next_run_time
        return now + timedelta(minutes=self.schedule_interval)

    def _calculate_hourly_schedule(self, now: datetime) -> Optional[datetime]:
        """Calculate next run time for hourly schedule."""
        if not self.schedule_interval:
            return None
        if self.next_run_time and now < self.next_run_time:
            return self.next_run_time
        return now + timedelta(hours=self.schedule_interval)

    def _calculate_daily_schedule(self, now: datetime) -> Optional[datetime]:
        """Calculate next run time for daily schedule."""
        if self.schedule_hour is None or self.schedule_minute is None:
            return None

        # Calculate the next run time for today
        next_run = now.replace(hour=self.schedule_hour, minute=self.schedule_minute, second=0, microsecond=0)

        # If the time has already passed today, schedule for tomorrow
        if next_run <= now:
            next_run += timedelta(days=1)

        return next_run

    def _calculate_weekly_schedule(self, now: datetime) -> Optional[datetime]:
        """Calculate next run time for weekly schedule."""
        if self.schedule_day_of_week is None or self.schedule_hour is None or self.schedule_minute is None:
            return None

        # Calculate days until next occurrence
        days_ahead = self.schedule_day_of_week - now.weekday()
        if days_ahead <= 0:  # Target day already happened this week
            days_ahead += 7

        # Calculate the next run time
        next_run = now.replace(hour=self.schedule_hour, minute=self.schedule_minute, second=0, microsecond=0)
        next_run += timedelta(days=days_ahead)

        return next_run

    def _calculate_monthly_schedule(self, now: datetime) -> Optional[datetime]:
        """Calculate next run time for monthly schedule."""
        if self.schedule_day_of_month is None or self.schedule_hour is None or self.schedule_minute is None:
            return None

        # Try to set the day for this month
        try:
            next_run = now.replace(
                day=self.schedule_day_of_month,
                hour=self.schedule_hour,
                minute=self.schedule_minute,
                second=0,
                microsecond=0,
            )
        except ValueError:
            # Day doesn't exist in this month, try next month
            if now.month == 12:
                next_run = now.replace(
                    year=now.year + 1,
                    month=1,
                    day=self.schedule_day_of_month,
                    hour=self.schedule_hour,
                    minute=self.schedule_minute,
                    second=0,
                    microsecond=0,
                )
            else:
                next_run = now.replace(
                    month=now.month + 1,
                    day=self.schedule_day_of_month,
                    hour=self.schedule_hour,
                    minute=self.schedule_minute,
                    second=0,
                    microsecond=0,
                )

        # If the time has already passed, move to next month
        if next_run <= now:
            if next_run.month == 12:
                next_run = next_run.replace(year=next_run.year + 1, month=1)
            else:
                next_run = next_run.replace(month=next_run.month + 1)

        return next_run
