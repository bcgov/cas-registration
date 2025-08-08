from typing import Any, Callable, Dict, Optional
from task_scheduler.models import ScheduledTask
from task_scheduler.config.settings import TASK_SCHEDULER_CONFIG
from .retryable import RetryableFunction
from .utils.paths import get_function_path


class TaskFactory:
    """Factory for creating task instances."""

    @staticmethod
    def create_retryable(
        func: Callable,
        tag: Optional[str] = None,
        max_retries: Optional[int] = None,
        retry_delay_minutes: Optional[int] = None,
        **kwargs: Any,
    ) -> RetryableFunction:
        """
        Create a RetryableFunction instance.

        Args:
            func: The function to make retryable
            tag: Tag for the retryable function
            max_retries: Maximum number of retry attempts
            retry_delay_minutes: Delay between retry attempts in minutes
            **kwargs: Additional configuration

        Returns:
            RetryableFunction instance
        """
        tag = tag or str(TASK_SCHEDULER_CONFIG['default_tag'])
        max_retries = max_retries or int(str(TASK_SCHEDULER_CONFIG['default_max_retries']))
        retry_delay_minutes = retry_delay_minutes or int(str(TASK_SCHEDULER_CONFIG['default_retry_delay']))

        return RetryableFunction(
            func=func,
            tag=tag,
            max_retries=max_retries,
            retry_delay_minutes=retry_delay_minutes,
        )

    @staticmethod
    def create_scheduled(
        func: Callable,
        schedule_type: str,
        tag: Optional[str] = None,
        schedule_interval: Optional[int] = None,
        schedule_hour: Optional[int] = None,
        schedule_minute: Optional[int] = None,
        schedule_day_of_week: Optional[int] = None,
        schedule_day_of_month: Optional[int] = None,
        **kwargs: Any,
    ) -> ScheduledTask:
        """
        Create a ScheduledTask instance.

        Args:
            func: The function to schedule
            schedule_type: One of 'minutes', 'hourly', 'daily', 'weekly', 'monthly'
            tag: Tag for the scheduled task
            schedule_interval: For minutes/hourly schedules
            schedule_hour: Hour (0-23) for fixed time schedules
            schedule_minute: Minute (0-59) for fixed time schedules
            schedule_day_of_week: Day of week (0=Monday, 6=Sunday) for weekly
            schedule_day_of_month: Day of month (1-31) for monthly
            **kwargs: Additional function parameters

        Returns:
            ScheduledTask instance (saved to database)
        """
        tag = tag or str(TASK_SCHEDULER_CONFIG['default_tag'])
        function_path = get_function_path(func)
        schedule_type_enum = TaskFactory._get_schedule_type_enum(schedule_type)

        # Prepare schedule data
        schedule_data = {
            'schedule_type': schedule_type_enum,
            'schedule_interval': schedule_interval,
            'schedule_hour': schedule_hour,
            'schedule_minute': schedule_minute,
            'schedule_day_of_week': schedule_day_of_week,
            'schedule_day_of_month': schedule_day_of_month,
        }

        # Find or create task
        existing_task = ScheduledTask.objects.filter(function_path=function_path, tag=str(tag), kwargs=kwargs).first()

        if existing_task:
            return TaskFactory._update_existing_task(existing_task, schedule_data, kwargs)
        else:
            return TaskFactory._create_new_task(function_path, str(tag), schedule_data, kwargs)

    @staticmethod
    def _get_schedule_type_enum(schedule_type: str) -> str:
        """Get ScheduleType enum from string."""
        schedule_type_map = {
            'minutes': ScheduledTask.ScheduleType.MINUTES,
            'hourly': ScheduledTask.ScheduleType.HOURLY,
            'daily': ScheduledTask.ScheduleType.DAILY,
            'weekly': ScheduledTask.ScheduleType.WEEKLY,
            'monthly': ScheduledTask.ScheduleType.MONTHLY,
        }

        if schedule_type not in schedule_type_map:
            raise ValueError(
                f"Invalid schedule_type: {schedule_type}. Must be one of: {list(schedule_type_map.keys())}"
            )

        return schedule_type_map[schedule_type]

    @staticmethod
    def _update_existing_task(
        existing_task: ScheduledTask, schedule_data: Dict[str, Any], kwargs: Dict[str, Any]
    ) -> ScheduledTask:
        """Update an existing scheduled task."""
        # Update schedule fields
        for field, value in schedule_data.items():
            if value is not None:
                setattr(existing_task, field, value)

        # Update kwargs and recalculate next run time
        existing_task.kwargs = kwargs
        existing_task.next_run_time = existing_task.calculate_next_run_time()
        existing_task.save()
        return existing_task

    @staticmethod
    def _create_new_task(
        function_path: str, tag: str, schedule_data: Dict[str, Any], kwargs: Dict[str, Any]
    ) -> ScheduledTask:
        """Create a new scheduled task."""
        # Remove None values from schedule_data
        clean_schedule_data = {k: v for k, v in schedule_data.items() if v is not None}

        scheduled_task = ScheduledTask(function_path=function_path, tag=tag, kwargs=kwargs, **clean_schedule_data)
        scheduled_task.next_run_time = scheduled_task.calculate_next_run_time()
        scheduled_task.save()
        return scheduled_task


# Convenience functions for easy usage
def create_retryable(func: Callable, **config: Any) -> RetryableFunction:
    """Create a retryable function with the given configuration."""
    return TaskFactory.create_retryable(func, **config)


def create_scheduled(func: Callable, schedule_type: str, **config: Any) -> ScheduledTask:
    """Create a scheduled task with the given configuration."""
    return TaskFactory.create_scheduled(func, schedule_type, **config)
