from dataclasses import dataclass
from typing import Optional, Callable, Literal


@dataclass
class ScheduledTaskConfig:
    func: Callable
    schedule_type: Literal["minutes", "hourly", "daily", "weekly", "monthly"]
    schedule_interval: Optional[int] = None
    schedule_hour: Optional[int] = None
    schedule_minute: Optional[int] = None
    schedule_day_of_week: Optional[int] = None
    schedule_day_of_month: Optional[int] = None
    tag: str = ""

    def __post_init__(self) -> None:
        self._validate()

    def _validate(self) -> None:
        # Validate minutes schedule
        if self.schedule_type == 'minutes':
            if not self.schedule_interval or self.schedule_interval <= 0:
                raise ValueError("minutes schedule requires positive schedule_interval")
            if self.schedule_hour is not None or self.schedule_minute is not None:
                raise ValueError("minutes schedule should not specify hour or minute")

        # Validate hourly schedule
        elif self.schedule_type == 'hourly':
            if not self.schedule_interval or self.schedule_interval <= 0:
                raise ValueError("hourly schedule requires positive schedule_interval")
            if self.schedule_hour is not None or self.schedule_minute is not None:
                raise ValueError("hourly schedule should not specify hour or minute")

        # Validate daily schedule
        elif self.schedule_type == 'daily':
            if self.schedule_hour is None or self.schedule_minute is None:
                raise ValueError("daily schedule requires schedule_hour and schedule_minute")
            if not (0 <= self.schedule_hour <= 23):
                raise ValueError("schedule_hour must be between 0 and 23")
            if not (0 <= self.schedule_minute <= 59):
                raise ValueError("schedule_minute must be between 0 and 59")
            if self.schedule_interval is not None:
                raise ValueError("daily schedule should not specify schedule_interval")

        # Validate weekly schedule
        elif self.schedule_type == 'weekly':
            if self.schedule_day_of_week is None:
                raise ValueError("weekly schedule requires schedule_day_of_week")
            if not (0 <= self.schedule_day_of_week <= 6):
                raise ValueError("schedule_day_of_week must be between 0 (Monday) and 6 (Sunday)")
            if self.schedule_hour is None or self.schedule_minute is None:
                raise ValueError("weekly schedule requires schedule_hour and schedule_minute")
            if not (0 <= self.schedule_hour <= 23):
                raise ValueError("schedule_hour must be between 0 and 23")
            if not (0 <= self.schedule_minute <= 59):
                raise ValueError("schedule_minute must be between 0 and 59")
            if self.schedule_interval is not None:
                raise ValueError("weekly schedule should not specify schedule_interval")

        # Validate monthly schedule
        elif self.schedule_type == 'monthly':
            if self.schedule_day_of_month is None:
                raise ValueError("monthly schedule requires schedule_day_of_month")
            if not (1 <= self.schedule_day_of_month <= 31):
                raise ValueError("schedule_day_of_month must be between 1 and 31")
            if self.schedule_hour is None or self.schedule_minute is None:
                raise ValueError("monthly schedule requires schedule_hour and schedule_minute")
            if not (0 <= self.schedule_hour <= 23):
                raise ValueError("schedule_hour must be between 0 and 23")
            if not (0 <= self.schedule_minute <= 59):
                raise ValueError("schedule_minute must be between 0 and 59")
            if self.schedule_interval is not None:
                raise ValueError("monthly schedule should not specify schedule_interval")

    def to_dict(self) -> dict:
        """Convert configuration to dictionary for database storage."""
        return {
            'schedule_type': self.schedule_type,
            'schedule_interval': self.schedule_interval,
            'schedule_hour': self.schedule_hour,
            'schedule_minute': self.schedule_minute,
            'schedule_day_of_week': self.schedule_day_of_week,
            'schedule_day_of_month': self.schedule_day_of_month,
            'tag': self.tag,
        }
