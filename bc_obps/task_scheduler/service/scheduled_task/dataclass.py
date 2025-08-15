from dataclasses import dataclass
from typing import Optional, Callable, Literal


@dataclass
class ScheduledTaskConfig:
    func: Callable
    schedule_type: Literal["minutes", "hourly", "daily", "weekly", "monthly", "yearly"]
    schedule_interval: Optional[int] = None
    schedule_hour: Optional[int] = None
    schedule_minute: Optional[int] = None
    schedule_day_of_week: Optional[int] = None
    schedule_day_of_month: Optional[int] = None
    schedule_month: Optional[int] = None
    tag: Optional[str] = None

    def __post_init__(self) -> None:
        self._validate()

    def _validate(self) -> None:
        validation_methods = {
            'minutes': self._validate_minutes_schedule,
            'hourly': self._validate_hourly_schedule,
            'daily': self._validate_daily_schedule,
            'weekly': self._validate_weekly_schedule,
            'monthly': self._validate_monthly_schedule,
            'yearly': self._validate_yearly_schedule,
        }

        validator = validation_methods.get(self.schedule_type)
        if validator:
            validator()
        else:
            raise ValueError(f"Invalid schedule_type: {self.schedule_type}")

    def _validate_minutes_schedule(self) -> None:
        if not self.schedule_interval or self.schedule_interval <= 0:
            raise ValueError("minutes schedule requires positive schedule_interval")
        if self.schedule_hour is not None or self.schedule_minute is not None:
            raise ValueError("minutes schedule should not specify hour or minute")

    def _validate_hourly_schedule(self) -> None:
        if not self.schedule_interval or self.schedule_interval <= 0:
            raise ValueError("hourly schedule requires positive schedule_interval")
        if self.schedule_hour is not None or self.schedule_minute is not None:
            raise ValueError("hourly schedule should not specify hour or minute")

    def _validate_daily_schedule(self) -> None:
        self._validate_time_fields()
        if self.schedule_interval is not None:
            raise ValueError("daily schedule should not specify schedule_interval")

    def _validate_weekly_schedule(self) -> None:
        if self.schedule_day_of_week is None:
            raise ValueError("weekly schedule requires schedule_day_of_week")
        if not (0 <= self.schedule_day_of_week <= 6):
            raise ValueError("schedule_day_of_week must be between 0 (Monday) and 6 (Sunday)")
        self._validate_time_fields()
        if self.schedule_interval is not None:
            raise ValueError("weekly schedule should not specify schedule_interval")

    def _validate_monthly_schedule(self) -> None:
        if self.schedule_day_of_month is None:
            raise ValueError("monthly schedule requires schedule_day_of_month")
        if not (1 <= self.schedule_day_of_month <= 31):
            raise ValueError("schedule_day_of_month must be between 1 and 31")
        self._validate_time_fields()
        if self.schedule_interval is not None:
            raise ValueError("monthly schedule should not specify schedule_interval")

    def _validate_yearly_schedule(self) -> None:
        if self.schedule_month is None:
            raise ValueError("yearly schedule requires schedule_month")
        if not (1 <= self.schedule_month <= 12):
            raise ValueError("schedule_month must be between 1 and 12")
        if self.schedule_day_of_month is None:
            raise ValueError("yearly schedule requires schedule_day_of_month")
        if not (1 <= self.schedule_day_of_month <= 31):
            raise ValueError("schedule_day_of_month must be between 1 and 31")
        self._validate_time_fields()
        if self.schedule_interval is not None:
            raise ValueError("yearly schedule should not specify schedule_interval")

    def _validate_time_fields(self) -> None:
        if self.schedule_hour is None or self.schedule_minute is None:
            raise ValueError("schedule requires schedule_hour and schedule_minute")
        if not (0 <= self.schedule_hour <= 23):
            raise ValueError("schedule_hour must be between 0 and 23")
        if not (0 <= self.schedule_minute <= 59):
            raise ValueError("schedule_minute must be between 0 and 59")

    def to_dict(self) -> dict:
        """Convert configuration to dictionary for database storage."""
        return {
            'schedule_type': self.schedule_type,
            'schedule_interval': self.schedule_interval,
            'schedule_hour': self.schedule_hour,
            'schedule_minute': self.schedule_minute,
            'schedule_day_of_week': self.schedule_day_of_week,
            'schedule_day_of_month': self.schedule_day_of_month,
            'schedule_month': self.schedule_month,
            'tag': self.tag or '',
        }
