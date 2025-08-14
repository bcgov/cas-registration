from model_bakery.recipe import Recipe
from task_scheduler.models import ScheduledTask, RetryTask


scheduled_task = Recipe(
    ScheduledTask,
    function_path="test.module.function",
    tag="test",
    status=ScheduledTask.Status.PENDING,
    schedule_type=ScheduledTask.ScheduleType.MINUTES,
    schedule_interval=5,
)

retry_task = Recipe(
    RetryTask,
    function_path="test.module.function",
    tag="test",
    kwargs={},
    status=RetryTask.Status.PENDING,
    max_retries=3,
    retry_count=0,
    retry_delay_minutes=5,
)
