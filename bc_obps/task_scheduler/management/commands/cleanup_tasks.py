from django.core.management.base import BaseCommand
from task_scheduler.service.task_service import TaskService
from task_scheduler.config.settings import TASK_SCHEDULER_CONFIG


class Command(BaseCommand):
    help = 'Clean up old completed tasks'

    def add_arguments(self, parser):
        parser.add_argument(
            '--days',
            type=int,
            default=TASK_SCHEDULER_CONFIG['cleanup_days'],
            help=f'Days to keep tasks (default: {TASK_SCHEDULER_CONFIG["cleanup_days"]})',
        )

    def handle(self, *args, **options):
        days = options['days']

        self.stdout.write(f'Cleaning up tasks older than {days} days...')

        try:
            deleted_count = TaskService.cleanup_old_tasks(days=days)

            if deleted_count > 0:
                self.stdout.write(self.style.SUCCESS(f'Successfully cleaned up {deleted_count} old tasks'))
            else:
                self.stdout.write(self.style.WARNING('No old tasks found to clean up'))

        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error cleaning up tasks: {e}'))
            raise
