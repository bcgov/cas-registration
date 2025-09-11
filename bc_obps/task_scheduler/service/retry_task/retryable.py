import logging
from typing import Any, Callable, Dict
from task_scheduler.models import RetryTask
from task_scheduler.utils.parameters import extract_function_parameters
from task_scheduler.utils.paths import get_function_path

logger = logging.getLogger(__name__)


def create_retry_task(
    function_path: str,
    kwargs: Dict[str, Any],
    tag: str = "",
    max_retries: int = 3,
    retry_delay_minutes: int = 5,
) -> RetryTask:
    existing_task = RetryTask.objects.filter(
        function_path=function_path,
        kwargs=kwargs,
        tag=tag,
        status__in=[RetryTask.Status.PENDING, RetryTask.Status.RUNNING, RetryTask.Status.FAILED],
    ).first()

    if existing_task:
        if existing_task.status == RetryTask.Status.FAILED and existing_task.can_retry:
            # Update existing failed task instead of creating duplicate
            existing_task.retry_count += 1
            existing_task.next_run_time = existing_task.calculate_next_run_time()
            existing_task.save()
            logger.info(
                f"Updated existing failed retry task for {function_path} (retry {existing_task.retry_count}/{existing_task.max_retries})"
            )
            return existing_task
        else:
            # Task exists but can't be updated (completed, running, or exhausted retries)
            logger.info(f"Retry task already exists for {function_path}, not creating duplicate")
            return existing_task

    # Create new retry task only if none exists or existing one can't be updated
    task = RetryTask(
        function_path=function_path,
        tag=tag,
        kwargs=kwargs,
        max_retries=max_retries,
        retry_delay_minutes=retry_delay_minutes,
    )

    task.next_run_time = task.calculate_next_run_time()
    task.save()
    logger.info(f"Created new retry task: {function_path}")
    return task


class RetryableFunction:
    """
    Wrapper class that provides explicit control over retry behavior.
    Creates retry tasks on failure for later execution by the task scheduler.
    """

    def __init__(self, func: Callable, tag: str = "", max_retries: int = 3, retry_delay_minutes: int = 5):
        self.func = func
        self.tag = tag
        self.max_retries = max_retries
        self.retry_delay_minutes = retry_delay_minutes

    def execute(self, *args: Any, **kwargs: Any) -> Any:
        """
        Execute function directly from application code.
        - Creates retry task on failure (args and kwargs need to be serializable)
        - Returns None gracefully (doesn't raise exception)
        - Logs the failure for debugging
        """
        serialized_params = extract_function_parameters(args, kwargs, self.func)
        try:
            logger.info(f"Executing {self.func.__name__} directly")
            result = self.func(*args, **kwargs)
            logger.info(f"Direct execution of {self.func.__name__} succeeded")
            return result
        except Exception as e:
            logger.error(f"Direct execution of {self.func.__name__} failed: {e}")
            function_path = get_function_path(self.func)
            create_retry_task(
                function_path=function_path,
                kwargs=serialized_params,
                tag=self.tag,
                max_retries=self.max_retries,
                retry_delay_minutes=self.retry_delay_minutes,
            )
            return None
