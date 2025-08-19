from typing import TypedDict


class TaskSchedulerConfig(TypedDict):
    default_retry_delay: int
    default_max_retries: int
    cleanup_days: int
    default_tag: str
    lock_timeout_minutes: int
    timezone: str


TASK_SCHEDULER_CONFIG: TaskSchedulerConfig = {
    'default_retry_delay': 5,
    'default_max_retries': 3,
    'cleanup_days': 30,
    'default_tag': '',
    'lock_timeout_minutes': 10,
    'timezone': 'America/Vancouver',  # Default timezone for task scheduling
}
