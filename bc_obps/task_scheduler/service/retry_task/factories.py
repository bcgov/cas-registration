from typing import Callable, Optional
from task_scheduler.config.settings import TASK_SCHEDULER_CONFIG
from task_scheduler.service.retry_task.retryable import RetryableFunction


def create_retryable(
    func: Callable,
    tag: Optional[str] = None,
    max_retries: Optional[int] = None,
    retry_delay_minutes: Optional[int] = None,
) -> RetryableFunction:
    """
    Create a RetryableFunction instance.

    Args:
        func: The function to make retryable
        tag: Tag for the retryable function
        max_retries: Maximum number of retry attempts
        retry_delay_minutes: Delay between retry attempts in minutes
    """
    tag = tag if tag is not None else str(TASK_SCHEDULER_CONFIG['default_tag'])
    max_retries = max_retries if max_retries is not None else int(str(TASK_SCHEDULER_CONFIG['default_max_retries']))
    retry_delay_minutes = (
        retry_delay_minutes
        if retry_delay_minutes is not None
        else int(str(TASK_SCHEDULER_CONFIG['default_retry_delay']))
    )

    return RetryableFunction(
        func=func,
        tag=tag,
        max_retries=max_retries,
        retry_delay_minutes=retry_delay_minutes,
    )
