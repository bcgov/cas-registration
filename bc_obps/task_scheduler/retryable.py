import logging
from typing import Any, Callable, Dict
from task_scheduler.models import RetryTask
from .utils.parameters import extract_function_parameters
from .utils.paths import get_function_path

logger = logging.getLogger(__name__)


def create_retry_task(
    function_path: str,
    kwargs: Dict[str, Any],
    tag: str = "",
    max_retries: int = 3,
    retry_delay_minutes: int = 5,
) -> RetryTask:
    """Create a retry task in the database."""
    # Check if a similar retry task already exists to prevent duplicates
    existing_task = RetryTask.objects.filter(
        function_path=function_path,
        kwargs=kwargs,
        tag=tag,
        status__in=[RetryTask.Status.PENDING, RetryTask.Status.RUNNING],
    ).first()

    if existing_task:
        logger.info(f"Retry task already exists for {function_path}, not creating duplicate")
        return existing_task

    task = RetryTask(
        function_path=function_path,
        tag=tag,
        kwargs=kwargs,
        max_retries=max_retries,
        retry_delay_minutes=retry_delay_minutes,
    )

    task.next_run_time = task.calculate_next_run_time()
    task.save()
    logger.info(f"Created retry task: {function_path}")
    return task


class RetryableFunction:
    """
    Wrapper class that provides explicit control over retry behavior.
    Separates direct execution (creates retry tasks) from retry execution (doesn't create new tasks).
    """

    def __init__(self, func: Callable, tag: str = "", max_retries: int = 3, retry_delay_minutes: int = 5):
        self.func = func
        self.tag = tag
        self.max_retries = max_retries
        self.retry_delay_minutes = retry_delay_minutes

    def execute_direct(self, *args: Any, **kwargs: Any) -> Any:
        """
        Execute function directly from application code.
        - Creates retry task on failure
        - Returns None gracefully (doesn't raise exception)
        - Logs the failure for debugging
        """
        try:
            logger.info(f"Executing {self.func.__name__} directly")
            result = self.func(*args, **kwargs)
            logger.info(f"Direct execution of {self.func.__name__} succeeded")
            return result
        except Exception as e:
            logger.error(f"Direct execution of {self.func.__name__} failed: {e}")
            # Create retry task for later execution
            logger.info(f"Creating retry task for function {self.func.__name__}")

            # Extract and serialize parameters
            serialized_params = extract_function_parameters(args, kwargs, self.func)

            function_path = get_function_path(self.func)
            create_retry_task(
                function_path=function_path,
                kwargs=serialized_params,
                tag=self.tag,
                max_retries=self.max_retries,
                retry_delay_minutes=self.retry_delay_minutes,
            )
            return None

    def execute_retry(self, *args: Any, **kwargs: Any) -> Any:
        """
        Execute function from task scheduler (retry context).
        - Does NOT create new retry tasks on failure
        - Logs errors for monitoring
        - Returns None gracefully (doesn't raise exception)
        """
        try:
            logger.info(f"Executing {self.func.__name__} as retry")
            result = self.func(*args, **kwargs)
            logger.info(f"Retry execution of {self.func.__name__} succeeded")
            return result
        except Exception as e:
            logger.error(f"Retry execution of {self.func.__name__} failed: {e}")
            # Don't create new retry task - just log the failure
            return None
