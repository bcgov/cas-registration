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
        try:
            func = resolve_function_from_path(task.function_path)
            if isinstance(task, RetryTask):
                return func(**task.kwargs)
            else:
                return func()
        except Exception as e:
            logger.error(f"Failed to execute task function {task.function_path}: {e}")
            raise

    @classmethod
    def process_task(cls, task: Task) -> bool:
        if not task.acquire_lock():
            logger.debug(f"Task {task.pk} is already locked")
            return False

        try:
            task.mark_attempt_started()
            cls.execute_task_function(task)
            task.mark_attempt_success()
            logger.info(f"Task {task.pk} completed successfully")
            return True

        except Exception as e:
            error_message = str(e)
            logger.error(f"Task {task.pk} failed: {error_message}")
            task.mark_attempt_failed(error_message)
            return False

        finally:
            task.next_run_time = task.calculate_next_run_time()
            task.save(update_fields=['next_run_time'])
            task.release_lock()

    @classmethod
    def get_due_tasks(cls, tag: Optional[str] = None) -> List[Task]:
        now = timezone.now()
        scheduled_tasks = ScheduledTask.objects.filter(
            status__in=[ScheduledTask.Status.PENDING, ScheduledTask.Status.FAILED, ScheduledTask.Status.COMPLETED],
            next_run_time__lte=now,
        )
        retry_tasks = RetryTask.objects.filter(
            status__in=[RetryTask.Status.PENDING, RetryTask.Status.FAILED], next_run_time__lte=now
        )

        if tag:
            scheduled_tasks = scheduled_tasks.filter(tag=tag)
            retry_tasks = retry_tasks.filter(tag=tag)

        due_tasks: List[Task] = []

        for scheduled_task in scheduled_tasks:
            due_tasks.append(cast(Task, scheduled_task))

        for retry_task in retry_tasks:
            if retry_task.can_retry:
                due_tasks.append(cast(Task, retry_task))

        return due_tasks

    @classmethod
    def cleanup_old_tasks(cls, days: int = 30) -> int:
        cutoff_date = timezone.now() - timedelta(days=days)
        scheduled_deleted, _ = ScheduledTask.objects.filter(
            status__in=[ScheduledTask.Status.COMPLETED, ScheduledTask.Status.INACTIVE], last_run_time__lt=cutoff_date
        ).delete()
        retry_deleted, _ = RetryTask.objects.filter(
            status=RetryTask.Status.COMPLETED, last_run_time__lt=cutoff_date
        ).delete()
        return scheduled_deleted + retry_deleted
