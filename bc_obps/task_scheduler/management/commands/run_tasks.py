from django.core.management.base import BaseCommand
from task_scheduler.service.task_service import TaskService


class Command(BaseCommand):
    help = 'Run due tasks (both scheduled and retry)'

    def add_arguments(self, parser):
        parser.add_argument('--tag', type=str, help='Process only tasks with specific tag')
        parser.add_argument('--dry-run', action='store_true', help='Show what would be run without executing')
        parser.add_argument('--verbose', action='store_true', help='Show detailed output')

    def handle(self, *args, **options):
        tag = options.get('tag')
        dry_run = options.get('dry_run', False)
        verbose = options.get('verbose', False)

        if dry_run:
            self._handle_dry_run()
            return

        due_tasks = TaskService.get_due_tasks(tag)

        if verbose:
            self._display_due_tasks(due_tasks)

        if not due_tasks:
            self.stdout.write("No due tasks found")
            return

        self._process_tasks(due_tasks, verbose)

    def _handle_dry_run(self):
        self.stdout.write("DRY RUN MODE - No tasks will be executed")
        self.stdout.write("=" * 50)
        due_tasks = TaskService.get_due_tasks()
        self.stdout.write(f"Would process {len(due_tasks)} tasks")

    def _display_due_tasks(self, due_tasks):
        self.stdout.write(f"Found {len(due_tasks)} due tasks:")
        for task in due_tasks:
            task_type = self._get_task_type(task)
            self.stdout.write(f"  - {task.function_path} ({task_type}) - Next run: {task.next_run_time}")

    @staticmethod
    def _get_task_type(task):
        return "Scheduled" if hasattr(task, 'schedule_type') else "Retry"

    def _process_tasks(self, due_tasks, verbose):
        self.stdout.write(f"Processing {len(due_tasks)} due tasks...")
        processed_count = 0
        successful_count = 0
        failed_count = 0

        for task in due_tasks:
            result = self._execute_single_task(task, verbose)
            if result == 'success':
                successful_count += 1
            else:
                failed_count += 1
            processed_count += 1
        self.stdout.write(
            f"Processing completed: {processed_count} processed, {successful_count} successful, {failed_count} failed"
        )

    def _execute_single_task(self, task, verbose):
        try:
            if verbose:
                task_type = self._get_task_type(task)
                self.stdout.write(f"Processing {task_type} task: {task.function_path}")

            if TaskService.process_task(task):
                if verbose:
                    self.stdout.write(f"  ✓ Success: {task.function_path}")
                return 'success'
            else:
                if verbose:
                    self.stdout.write(f"  ✗ Failed: {task.function_path}")
                return 'failed'
        except Exception as e:
            self.stdout.write(f"  ✗ Error processing task {task.function_path}: {e}")
            return 'failed'
