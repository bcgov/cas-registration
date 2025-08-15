import logging
from typing import Dict, Any
from task_scheduler.models import ScheduledTask

logger = logging.getLogger(__name__)


class ScheduledTaskSynchronizer:
    @classmethod
    def sync_tasks(cls, discovered_tasks: Dict[str, Dict[str, Any]]) -> Dict[str, int]:
        existing_tasks = {task.function_path: task for task in ScheduledTask.objects.all()}
        created_count, updated_count = cls._process_discovered_tasks(discovered_tasks, existing_tasks)
        deactivated_count = cls._deactivate_removed_tasks(discovered_tasks, existing_tasks)

        return {'created': created_count, 'updated': updated_count, 'deactivated': deactivated_count}

    @classmethod
    def _process_discovered_tasks(
        cls, discovered_tasks: Dict[str, Dict[str, Any]], existing_tasks: Dict[str, ScheduledTask]
    ) -> tuple[int, int]:
        created_count = 0
        updated_count = 0

        for function_path, task_config in discovered_tasks.items():
            if function_path in existing_tasks:
                updated_count += cls._handle_existing_task(existing_tasks[function_path], task_config)
            else:
                created_count += cls._create_new_task(function_path, task_config)

        return created_count, updated_count

    @classmethod
    def _handle_existing_task(cls, task: ScheduledTask, task_config: Dict[str, Any]) -> int:
        updated = 0
        if cls._update_task_if_needed(task, task_config):
            updated = 1

        cls._activate_task_if_needed(task)
        return updated

    @classmethod
    def _update_task_if_needed(cls, task: ScheduledTask, task_config: Dict[str, Any]) -> bool:
        updated = False

        # Check each field for changes
        fields_to_check = [
            'schedule_type',
            'schedule_interval',
            'schedule_hour',
            'schedule_minute',
            'schedule_day_of_week',
            'schedule_day_of_month',
            'tag',
        ]

        for field in fields_to_check:
            new_value = task_config.get(field)
            current_value = getattr(task, field)

            if new_value != current_value:
                setattr(task, field, new_value)
                updated = True

        if updated:
            # Recalculate next run time
            task.next_run_time = task.calculate_next_run_time(force_recalculate=True)
            task.save()

        return updated

    @classmethod
    def _activate_task_if_needed(cls, task: ScheduledTask) -> None:
        if task.status == ScheduledTask.Status.INACTIVE:
            task.status = ScheduledTask.Status.PENDING
            task.save(update_fields=['status'])

    @classmethod
    def _create_new_task(cls, function_path: str, task_config: Dict[str, Any]) -> bool:
        try:
            # Extract schedule parameters
            schedule_type = task_config.get('schedule_type')
            if not schedule_type:
                logger.warning(f"{function_path} missing schedule_type")
                return False

            # Create the task directly using the model
            task = ScheduledTask(
                function_path=function_path,
                schedule_type=schedule_type,
                tag=task_config.get('tag', ''),
                schedule_interval=task_config.get('schedule_interval'),
                schedule_hour=task_config.get('schedule_hour'),
                schedule_minute=task_config.get('schedule_minute'),
                schedule_day_of_week=task_config.get('schedule_day_of_week'),
                schedule_day_of_month=task_config.get('schedule_day_of_month'),
                status=ScheduledTask.Status.PENDING,
            )

            # Calculate next run time
            task.next_run_time = task.calculate_next_run_time()
            task.save()
            return True

        except Exception as e:
            logger.error(f"Error creating task for {function_path}: {e}")
            return False

    @classmethod
    def _deactivate_removed_tasks(
        cls, discovered_tasks: Dict[str, Dict[str, Any]], existing_tasks: Dict[str, ScheduledTask]
    ) -> int:
        deactivated_count = 0
        discovered_paths = set(discovered_tasks.keys())

        for function_path, task in existing_tasks.items():
            if function_path not in discovered_paths and task.status != ScheduledTask.Status.INACTIVE:
                task.status = ScheduledTask.Status.INACTIVE
                task.save(update_fields=['status'])
                deactivated_count += 1
        return deactivated_count
