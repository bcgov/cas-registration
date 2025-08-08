import logging
from datetime import timedelta
from typing import Any, List, Optional, Union, cast
from django.utils import timezone
from task_scheduler.models import ScheduledTask, RetryTask
from task_scheduler.utils.paths import resolve_function_from_path

logger = logging.getLogger(__name__)

Task = Union[ScheduledTask, RetryTask]


class TaskService:
    """Service for processing and executing tasks."""

    @classmethod
    def execute_task_function(cls, task: Task) -> Any:
        """Execute a task function dynamically."""
        try:
            # Resolve the function from its path
            func = resolve_function_from_path(task.function_path)

            # For retry tasks, just call the function directly
            if isinstance(task, RetryTask):
                return func(**task.kwargs)
            else:
                # For scheduled tasks, call the function directly
                return func(**task.kwargs)
        except Exception as e:
            logger.error(f"Failed to execute task function {task.function_path}: {e}")
            raise

    @classmethod
    def process_task(cls, task: Task) -> bool:
        """Process a single task."""
        if not task.acquire_lock():
            logger.debug(f"Task {task.pk} is already locked")
            return False

        try:
            task.mark_attempt_started()
            _ = cls.execute_task_function(task)
            task.mark_attempt_success()

            # Calculate next run time based on task type
            if isinstance(task, ScheduledTask):
                task.next_run_time = task.calculate_next_run_time()
            else:
                # For retry tasks, don't schedule next run on success
                task.next_run_time = None
            task.save(update_fields=['next_run_time'])

            logger.info(f"Task {task.pk} completed successfully")
            return True

        except Exception as e:
            error_message = str(e)
            logger.error(f"Task {task.pk} failed: {error_message}")
            task.mark_attempt_failed(error_message)

            # Calculate next run time for retry tasks
            if isinstance(task, RetryTask) and task.can_retry:
                task.next_run_time = task.calculate_next_run_time()
                task.save(update_fields=['next_run_time'])
                logger.info(f"Task {task.pk} scheduled for retry")
            return False
        finally:
            task.release_lock()

    @classmethod
    def get_due_tasks(cls, tag: Optional[str] = None) -> List[Task]:
        """Get tasks that are due for execution."""
        # Get both scheduled and retry tasks
        scheduled_tasks = ScheduledTask.objects.filter(
            status__in=[ScheduledTask.Status.PENDING, ScheduledTask.Status.FAILED]
        )
        retry_tasks = RetryTask.objects.filter(status__in=[RetryTask.Status.PENDING, RetryTask.Status.FAILED])

        if tag:
            scheduled_tasks = scheduled_tasks.filter(tag=tag)
            retry_tasks = retry_tasks.filter(tag=tag)

        due_tasks: List[Task] = []

        # Filter scheduled tasks - they can always be executed if due
        for scheduled_task in scheduled_tasks:
            if scheduled_task.is_due_for_execution():
                due_tasks.append(cast(Task, scheduled_task))

        # Filter retry tasks - only if they haven't exceeded max retries
        for retry_task in retry_tasks:
            if retry_task.is_due_for_execution() and retry_task.can_retry:
                due_tasks.append(cast(Task, retry_task))

        return due_tasks

    @classmethod
    def cleanup_old_tasks(cls, days: int = 30) -> int:
        """Clean up old completed tasks."""
        cutoff_date = timezone.now() - timedelta(days=days)

        # Clean up old scheduled tasks
        scheduled_deleted, _ = ScheduledTask.objects.filter(
            status=ScheduledTask.Status.COMPLETED, last_run_time__lt=cutoff_date
        ).delete()

        # Clean up old retry tasks
        retry_deleted, _ = RetryTask.objects.filter(
            status=RetryTask.Status.COMPLETED, last_run_time__lt=cutoff_date
        ).delete()

        return scheduled_deleted + retry_deleted

    @classmethod
    def clear_stale_locks(cls) -> int:
        """Clear stale locks that are older than 30 minutes."""
        cutoff_time = timezone.now() - timedelta(minutes=30)

        # Clear stale scheduled task locks
        stale_scheduled = ScheduledTask.objects.filter(lock_acquired_at__lt=cutoff_time, lock_acquired_at__isnull=False)

        # Clear stale retry task locks
        stale_retry = RetryTask.objects.filter(lock_acquired_at__lt=cutoff_time, lock_acquired_at__isnull=False)

        cleared_count = 0
        for task in list(stale_scheduled) + list(stale_retry):
            task.release_lock()
            cleared_count += 1

        return cleared_count
