# Task Scheduler App

## Overview

The task scheduler consists of two main types of tasks:

1. **ScheduledTask**: Tasks that run on a regular schedule (every X minutes, hourly, daily, weekly, monthly)
2. **RetryTask**: Tasks that are created automatically when functions fail and need to be retried

## Architecture

### Core Components

- **Models**: `ScheduledTask` and `RetryTask` extend the base `Task` model
- **Service Layer**: `TaskService` handles task execution and management
- **Discovery**: `ScheduledTaskDiscovery` automatically discovers scheduled tasks from Django apps
- **Synchronization**: `ScheduledTaskSynchronizer` syncs discovered tasks with the database
- **Retryable Functions**: `RetryableFunction` wrapper for functions that need retry capability
- **Management Commands**: Django management commands for running, syncing, and cleaning up tasks

### Database Tables

- `common.scheduled_task`: Stores scheduled tasks
- `common.retry_task`: Stores retry tasks
- Both tables include indexes for efficient querying by status and next_run_time

## Task Types

### ScheduledTask

Scheduled tasks run on a regular basis according to their schedule configuration.

#### Schedule Types

1. **Minutes**: Run every X minutes

   ```python
   schedule_type = "minutes"
   schedule_interval = 5  # Every 5 minutes
   ```

2. **Hourly**: Run every X hours

   ```python
   schedule_type = "hourly"
   schedule_interval = 2  # Every 2 hours
   ```

3. **Daily**: Run daily at a specific time

   ```python
   schedule_type = "daily"
   schedule_hour = 9      # 9 AM
   schedule_minute = 30   # 30 minutes past
   ```

4. **Weekly**: Run weekly on a specific day and time

   ```python
   schedule_type = "weekly"
   schedule_day_of_week = 0  # Monday (0=Monday, 6=Sunday)
   schedule_hour = 10         # 10 AM
   schedule_minute = 0        # 0 minutes past
   ```

5. **Monthly**: Run monthly on a specific day and time
   ```python
   schedule_type = "monthly"
   schedule_day_of_month = 15  # 15th of the month
   schedule_hour = 12           # 12 PM
   schedule_minute = 0          # 0 minutes past
   ```

### RetryTask

Retry tasks are created automatically when functions fail and need to be retried.

#### Configuration

- **max_retries**: Maximum number of retry attempts (default: 3)
- **retry_delay_minutes**: Delay between retry attempts (default: 5 minutes)
- **retry_count**: Current retry attempt number

## Creating Tasks

### Method 1: Using ScheduledTaskConfig (Recommended)

The `ScheduledTaskConfig` dataclass provides a clean way to define scheduled tasks in your Django apps.

#### Creating Scheduled Tasks

Create a `tasks.py` file in your Django app:

```python
# myapp/tasks.py
from task_scheduler.service.scheduled_task.dataclass import ScheduledTaskConfig

def daily_report_function():
    """Generate daily report."""
    pass

def weekly_cleanup_function():
    """Weekly cleanup task."""
    pass

# Define scheduled tasks
SCHEDULED_TASKS = [
    ScheduledTaskConfig(
        func=daily_report_function,
        schedule_type='daily',
        schedule_hour=9,
        schedule_minute=30,
        tag='reports'
    ),
    ScheduledTaskConfig(
        func=weekly_cleanup_function,
        schedule_type='weekly',
        schedule_day_of_week=0,  # Monday
        schedule_hour=10,
        schedule_minute=0,
        tag='maintenance'
    )
]
```

Then sync the tasks to the database:

```bash
python manage.py sync_tasks
```

#### Creating Retryable Functions

```python
from task_scheduler.service.retry_task.factories import create_retryable

# Create a retryable function wrapper
retryable_func = create_retryable(
    func=unreliable_function,
    tag="data_processing",
    max_retries=5,
    retry_delay_minutes=10
)

# Use the retryable function
result = retryable_func.execute(param1="value1", param2="value2")
```

## Running Tasks

### Management Commands

The task scheduler provides Django management commands for running tasks:

#### Syncing Discovered Tasks

```bash
# Sync all discovered tasks from all apps
python manage.py sync_tasks

# Sync tasks from specific app only
python manage.py sync_tasks --app=myapp

# Verbose output
python manage.py sync_tasks --verbose
```

#### Running Due Tasks

```bash
# Run all due tasks
python manage.py run_tasks

# Run tasks with specific tag
python manage.py run_tasks --tag=my_app

# Verbose output
python manage.py run_tasks --verbose
```

#### Cleaning Up Old Tasks

```bash
# Clean up tasks older than 30 days (default)
python manage.py cleanup_tasks

# Clean up tasks older than 7 days
python manage.py cleanup_tasks --days=7

# Verbose output
python manage.py cleanup_tasks --verbose
```

## Task Discovery and Synchronization

### Automatic Task Discovery

The task scheduler automatically discovers scheduled tasks from Django apps by looking for `tasks.py` files with `SCHEDULED_TASKS` lists.

#### Discovery Process

1. **Scan Apps**: Looks through all Django apps in `LOCAL_APPS` setting
2. **Find Tasks**: Locates `tasks.py` files with `SCHEDULED_TASKS` configuration
3. **Import Tasks**: Imports and validates task configurations
4. **Sync Database**: Synchronizes discovered tasks with the database

#### Task Configuration Validation

The `ScheduledTaskConfig` dataclass validates task configurations:

- **Minutes/Hourly**: Requires positive `schedule_interval`
- **Daily/Weekly/Monthly**: Requires `schedule_hour` and `schedule_minute`
- **Weekly**: Requires `schedule_day_of_week` (0-6)
- **Monthly**: Requires `schedule_day_of_month` (1-31)

### Synchronization Process

The `ScheduledTaskSynchronizer` handles database synchronization:

1. **Create New Tasks**: Creates new tasks for newly discovered functions
2. **Update Existing Tasks**: Updates task configurations when they change
3. **Deactivate Removed Tasks**: Marks tasks as inactive when they're no longer discovered
4. **Calculate Next Run Times**: Sets appropriate next run times based on schedule

## Task Lifecycle

### ScheduledTask Lifecycle

1. **PENDING**: Task is created and waiting to be executed
2. **RUNNING**: Task is currently being executed
3. **COMPLETED**: Task completed successfully
4. **FAILED**: Task failed (will be retried according to schedule)

### RetryTask Lifecycle

1. **PENDING**: Task is waiting to be retried
2. **RUNNING**: Task is currently being executed
3. **COMPLETED**: Task completed successfully
4. **FAILED**: Task failed (will be retried if retry_count < max_retries)

## Locking Mechanism

The task scheduler uses a locking mechanism to prevent concurrent execution of the same task:

- **Lock acquisition**: Tasks acquire a lock before execution
- **Lock expiration**: Locks expire after 10 minutes (configurable)
- **Lock release**: Locks are released after task completion or failure
- **Cross-instance safety**: Locks work across different process instances

## Error Handling

### Retry Logic

- **ScheduledTask**: Failed tasks remain in FAILED status and will be retried on the next scheduled run
- **RetryTask**: Failed tasks are retried up to `max_retries` times with `retry_delay_minutes` delay

### Error Logging

All errors are logged with detailed information:

- Function path
- Error message
- Retry count (for retry tasks)
- Timestamp

### Error History

The task scheduler maintains a history of the last 5 failed errors for each task:

- **Error History**: Stored in JSON format with error message and timestamp
- **Automatic Cleanup**: Old errors are automatically removed when new ones occur
- **Debugging**: Provides visibility into recent failures for troubleshooting
- **Storage**: Each error entry includes the error message and ISO timestamp

## Configuration

### Settings

The task scheduler can be configured through Django settings:

```python
# settings.py
TASK_SCHEDULER_CONFIG = {
    'default_tag': '',
    'default_max_retries': 3,
    'default_retry_delay': 5,
    'lock_timeout_minutes': 10,
    'cleanup_days': 30,
}
```

## Examples

### Example 1: Daily Report Generation

```python
# myapp/tasks.py
from task_scheduler.service.scheduled_task.dataclass import ScheduledTaskConfig

def generate_daily_report(report_type="summary"):
    """Generate daily report."""
    # Your report generation logic here
    pass

# Define in SCHEDULED_TASKS list
SCHEDULED_TASKS = [
    ScheduledTaskConfig(
        func=generate_daily_report,
        schedule_type='daily',
        schedule_hour=6,
        schedule_minute=0,
        tag='reports'
    )
]
```

### Example 2: Email Processing with Retries

```python
from task_scheduler.service.retry_task.factories import create_retryable

def send_email_notification(user_id, message):
    """Send email notification with retry capability."""
    # Your email sending logic here
    pass

# Create retryable email function
retryable_email = create_retryable(
    func=send_email_notification,
    tag="email_notifications",
    max_retries=5,
    retry_delay_minutes=10
)

# Use in your application. Note that args and kwargs need to be serializable (e.g. integers, not django objects). Otherwise, they will fail on extract_function_parameters.
def notify_user(user_id, message):
    retryable_email.execute(user_id=user_id)
```

### Example 3: Weekly Data Cleanup

```python
# myapp/tasks.py
from task_scheduler.service.scheduled_task.dataclass import ScheduledTaskConfig

def cleanup_old_data(older_than_days=30):
    """Clean up old data."""
    # Your cleanup logic here
    pass

# Define in SCHEDULED_TASKS list
SCHEDULED_TASKS = [
    ScheduledTaskConfig(
        func=cleanup_old_data,
        schedule_type='weekly',
        schedule_day_of_week=6,  # Sunday
        schedule_hour=2,
        schedule_minute=0,
        tag='maintenance'
    )
]
```
