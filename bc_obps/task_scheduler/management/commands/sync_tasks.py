from django.core.management.base import BaseCommand
from django.conf import settings
from task_scheduler.service.scheduled_task.discovery import ScheduledTaskDiscovery
from task_scheduler.service.scheduled_task.sync import ScheduledTaskSynchronizer


class Command(BaseCommand):
    help = 'Sync SCHEDULED_TASKS with the database'

    def add_arguments(self, parser):
        parser.add_argument('--app', type=str, help='Sync tasks from specific app only')
        parser.add_argument('--dry-run', action='store_true', help='Show what would be synced without making changes')

    def handle(self, *args, **options):
        if options['dry_run']:
            self._dry_run_sync(options)
            return

        self._sync_tasks(options)

    def _get_discovered_tasks(self, options):
        if options.get('app'):
            app_name = options['app']
            if app_name not in getattr(settings, 'LOCAL_APPS', []):
                self.stdout.write(self.style.ERROR(f"App '{app_name}' is not in LOCAL_APPS"))
                return None, None
            return ScheduledTaskDiscovery.discover_app_tasks(app_name), app_name

        return ScheduledTaskDiscovery.discover_all_tasks(), None

    def _dry_run_sync(self, options):
        discovered_tasks, _ = self._get_discovered_tasks(options)
        if not discovered_tasks:
            self.stdout.write("No scheduled tasks to sync.")
            return

        self.stdout.write("DRY RUN - Would sync the following tasks:")
        self.stdout.write("=" * 50)

        for function_path, config in discovered_tasks.items():
            self.stdout.write(f"✓ {function_path}")
            self.stdout.write(f"  Schedule: {config['schedule_type']}")
            if config.get('tag'):
                self.stdout.write(f"  Tag: {config['tag']}")
        self.stdout.write(f"Total: {len(discovered_tasks)} tasks would be synced")

    def _sync_tasks(self, options):
        discovered_tasks, app_name = self._get_discovered_tasks(options)
        if not discovered_tasks:
            self.stdout.write("No scheduled tasks discovered.")
            return

        if app_name:
            self.stdout.write(f"Syncing tasks from app: {app_name}")
        else:
            self.stdout.write("Syncing all discovered tasks...")

        self.stdout.write(f"Discovered {len(discovered_tasks)} scheduled tasks")

        # Sync with database
        results = ScheduledTaskSynchronizer.sync_tasks(discovered_tasks)

        # Report results
        if results['created'] > 0:
            self.stdout.write(self.style.SUCCESS(f"Created {results['created']} new tasks"))

        if results['updated'] > 0:
            self.stdout.write(self.style.WARNING(f"Updated {results['updated']} existing tasks"))

        if results['deactivated'] > 0:
            self.stdout.write(self.style.WARNING(f"Deactivated {results['deactivated']} unused tasks"))

        if all(count == 0 for count in results.values()):
            self.stdout.write("No changes needed - all tasks are in sync")
