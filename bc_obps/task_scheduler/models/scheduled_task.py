from datetime import datetime, timedelta, time
from typing import Callable, Dict, Optional
from zoneinfo import ZoneInfo
from django.db import models
from django.utils import timezone as django_timezone
from .task import Task
from task_scheduler.config.settings import TASK_SCHEDULER_CONFIG


class ScheduledTask(Task):
    """Model for scheduled tasks that run on a regular basis."""

    class ScheduleType(models.TextChoices):
        MINUTES = "minutes", "Every X Minutes"
        HOURLY = "hourly", "Every X Hours"
        DAILY = "daily", "Daily at Fixed Time"
        WEEKLY = "weekly", "Weekly on Specific Day"
        MONTHLY = "monthly", "Monthly on Specific Day"
        YEARLY = "yearly", "Yearly on Specific Date"

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
    schedule_month = models.PositiveIntegerField(null=True, blank=True, help_text="Month (1-12) for yearly schedules")

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

    def calculate_next_run_time(self, force_recalculate: bool = False, **kwargs: object) -> Optional[datetime]:
        if not self.schedule_type:
            return None

        if force_recalculate:
            return self._calculate_fresh_time()

        # Preserve existing time if it's in the future
        if self.next_run_time and self.next_run_time > django_timezone.now():
            return self.next_run_time

        return self._calculate_fresh_time()

    def _calculate_fresh_time(self) -> Optional[datetime]:
        now: datetime = django_timezone.now()
        schedule_calculators: Dict[str, Callable[[datetime], Optional[datetime]]] = {
            self.ScheduleType.MINUTES: self._calculate_minutes_schedule,
            self.ScheduleType.HOURLY: self._calculate_hourly_schedule,
            self.ScheduleType.DAILY: self._calculate_daily_schedule,
            self.ScheduleType.WEEKLY: self._calculate_weekly_schedule,
            self.ScheduleType.MONTHLY: self._calculate_monthly_schedule,
            self.ScheduleType.YEARLY: self._calculate_yearly_schedule,
        }
        calculator = schedule_calculators.get(self.schedule_type)
        if calculator:
            return calculator(now)
        return None

    def _calculate_minutes_schedule(self, now: datetime) -> Optional[datetime]:
        if not self.schedule_interval:
            return None
        return now + timedelta(minutes=self.schedule_interval)

    def _calculate_hourly_schedule(self, now: datetime) -> Optional[datetime]:
        if not self.schedule_interval:
            return None
        return now + timedelta(hours=self.schedule_interval)

    @staticmethod
    def _get_task_timezone() -> ZoneInfo:
        task_timezone = TASK_SCHEDULER_CONFIG.get('timezone', 'America/Vancouver')
        return ZoneInfo(task_timezone)

    def _create_scheduled_time_in_timezone(
        self, base_time: datetime, hour: int, minute: int, day_offset: int = 0
    ) -> datetime:
        """Helper method to create a scheduled time in the configured timezone.

        Args:
            base_time: Base datetime to work from
            hour: Hour to schedule (0-23)
            minute: Minute to schedule (0-59)
            day_offset: Days to add (0 for same day, 1 for next day, etc.)

        Returns:
            Timezone-aware datetime in the configured timezone
        """
        task_tz = self._get_task_timezone()

        # Convert base time to the task timezone
        task_local_base = base_time.astimezone(task_tz)

        # Create a datetime that properly represents the local time in the target timezone
        target_date = task_local_base.date()
        if day_offset > 0:
            target_date += timedelta(days=day_offset)

        target_time = time(hour, minute, 0, 0)
        naive_scheduled = datetime.combine(target_date, target_time)

        # Use Django's make_aware to properly create timezone-aware datetime
        task_local_scheduled = django_timezone.make_aware(naive_scheduled, timezone=task_tz)

        return task_local_scheduled

    def _create_fixed_time_schedule(
        self,
        now: datetime,
        hour: int,
        minute: int,
        day_offset: int = 0,
        month: Optional[int] = None,
        year: Optional[int] = None,
        day: Optional[int] = None,
    ) -> datetime:
        """Create a fixed time schedule with optional date components.

        Args:
            now: Current datetime
            hour: Hour to schedule (0-23)
            minute: Minute to schedule (0-59)
            day_offset: Days to add (0 for same day, 1 for next day, etc.)
            month: Month to set (1-12), if None uses current month
            year: Year to set, if None uses current year
            day: Day to set (1-31), if None uses current day

        Returns:
            Timezone-aware datetime in UTC
        """
        task_tz = self._get_task_timezone()
        task_local_now = now.astimezone(task_tz)

        # Start with current date/time
        target_date = task_local_now.date()
        if day_offset > 0:
            target_date += timedelta(days=day_offset)

        # Create the scheduled time
        task_local_scheduled = self._create_scheduled_time_in_timezone(now, hour, minute, day_offset)

        # Apply date component overrides if specified
        if day is not None:
            task_local_scheduled = task_local_scheduled.replace(day=day)
        if month is not None:
            task_local_scheduled = task_local_scheduled.replace(month=month)
        if year is not None:
            task_local_scheduled = task_local_scheduled.replace(year=year)

        # Convert back to UTC for storage
        return task_local_scheduled.astimezone(ZoneInfo("UTC"))

    def _advance_to_next_period_if_past(
        self, scheduled_time: datetime, now: datetime, advance_func: Callable[[datetime], datetime]
    ) -> datetime:
        """Advance scheduled time to next period if it's in the past.

        Args:
            scheduled_time: The scheduled time to check
            now: Current time
            advance_func: Function to advance the time to next period

        Returns:
            Updated scheduled time
        """
        task_tz = self._get_task_timezone()
        task_local_scheduled = scheduled_time.astimezone(task_tz)
        task_local_now = now.astimezone(task_tz)

        if task_local_scheduled <= task_local_now:
            task_local_scheduled = advance_func(task_local_scheduled)

        return task_local_scheduled.astimezone(ZoneInfo("UTC"))

    def _calculate_daily_schedule(self, now: datetime) -> Optional[datetime]:
        if self.schedule_hour is None or self.schedule_minute is None:
            return None

        # Create scheduled time for today
        task_local_scheduled = self._create_scheduled_time_in_timezone(now, self.schedule_hour, self.schedule_minute)

        # If the time has already passed today, schedule for tomorrow
        if task_local_scheduled <= now.astimezone(self._get_task_timezone()):
            task_local_scheduled = self._create_scheduled_time_in_timezone(
                now, self.schedule_hour, self.schedule_minute, day_offset=1
            )

        # Convert back to UTC for storage
        return task_local_scheduled.astimezone(ZoneInfo("UTC"))

    def _calculate_weekly_schedule(self, now: datetime) -> Optional[datetime]:
        if self.schedule_day_of_week is None or self.schedule_hour is None or self.schedule_minute is None:
            return None

        task_tz = self._get_task_timezone()
        task_local_now = now.astimezone(task_tz)

        # Calculate days until next occurrence
        days_ahead = self.schedule_day_of_week - task_local_now.weekday()
        if days_ahead <= 0:  # Target day already happened this week
            days_ahead += 7

        task_local_scheduled = self._create_scheduled_time_in_timezone(
            now, self.schedule_hour, self.schedule_minute, day_offset=days_ahead
        )

        # Convert back to UTC for storage
        return task_local_scheduled.astimezone(ZoneInfo("UTC"))

    def _calculate_monthly_schedule(self, now: datetime) -> Optional[datetime]:
        if self.schedule_day_of_month is None or self.schedule_hour is None or self.schedule_minute is None:
            return None

        def advance_month(scheduled_time: datetime) -> datetime:
            if scheduled_time.month == 12:
                return scheduled_time.replace(year=scheduled_time.year + 1, month=1)
            else:
                return scheduled_time.replace(month=scheduled_time.month + 1)

        # Try to create schedule for current month
        try:
            scheduled_time = self._create_fixed_time_schedule(
                now,
                self.schedule_hour,
                self.schedule_minute,
                day=self.schedule_day_of_month,
                month=now.month,
                year=now.year,
            )
        except ValueError:
            # Day doesn't exist in this month, try next month
            next_month = 1 if now.month == 12 else now.month + 1
            next_year = now.year + 1 if now.month == 12 else now.year
            scheduled_time = self._create_fixed_time_schedule(
                now,
                self.schedule_hour,
                self.schedule_minute,
                day=self.schedule_day_of_month,
                month=next_month,
                year=next_year,
            )

        # Advance to next month if time has passed
        return self._advance_to_next_period_if_past(scheduled_time, now, advance_month)

    def _calculate_yearly_schedule(self, now: datetime) -> Optional[datetime]:
        if (
            self.schedule_month is None
            or self.schedule_day_of_month is None
            or self.schedule_hour is None
            or self.schedule_minute is None
        ):
            return None

        def advance_year(scheduled_time: datetime) -> datetime:
            return scheduled_time.replace(year=scheduled_time.year + 1)

        try:
            scheduled_time = self._create_fixed_time_schedule(
                now,
                self.schedule_hour,
                self.schedule_minute,
                day=self.schedule_day_of_month,
                month=self.schedule_month,
                year=now.year,
            )
        except ValueError:
            # Date doesn't exist in this year, try next year
            scheduled_time = self._create_fixed_time_schedule(
                now,
                self.schedule_hour,
                self.schedule_minute,
                day=self.schedule_day_of_month,
                month=self.schedule_month,
                year=now.year + 1,
            )

        # Advance to next year if time has passed
        return self._advance_to_next_period_if_past(scheduled_time, now, advance_year)
