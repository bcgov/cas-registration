from unittest.mock import patch
from django.test import SimpleTestCase
from django.core.management import call_command


class TestSyncTasksCommand(SimpleTestCase):
    def setUp(self):
        self.mock_discovered_tasks = {
            'test.module.function1': {
                'schedule_type': 'daily',
                'tag': 'test_tag1',
                'schedule_hour': 10,
                'schedule_minute': 30,
            },
            'test.module.function2': {'schedule_type': 'hourly', 'tag': 'test_tag2'},
        }

    @patch('task_scheduler.management.commands.sync_tasks.ScheduledTaskDiscovery.discover_all_tasks')
    @patch('task_scheduler.management.commands.sync_tasks.ScheduledTaskSynchronizer.sync_tasks')
    def test_sync_tasks_all_apps(self, mock_sync, mock_discover):
        mock_discover.return_value = self.mock_discovered_tasks
        mock_sync.return_value = {'created': 2, 'updated': 0, 'deactivated': 0}

        call_command('sync_tasks')

        mock_discover.assert_called_once()
        mock_sync.assert_called_once_with(self.mock_discovered_tasks)

    @patch('task_scheduler.management.commands.sync_tasks.ScheduledTaskDiscovery.discover_app_tasks')
    @patch('task_scheduler.management.commands.sync_tasks.ScheduledTaskSynchronizer.sync_tasks')
    def test_sync_tasks_specific_app(self, mock_sync, mock_discover):
        mock_discover.return_value = self.mock_discovered_tasks
        mock_sync.return_value = {'created': 1, 'updated': 1, 'deactivated': 0}

        with patch('django.conf.settings.LOCAL_APPS', ['test_app']):
            call_command('sync_tasks', app='test_app')

        mock_discover.assert_called_once_with('test_app')
        mock_sync.assert_called_once_with(self.mock_discovered_tasks)

    @patch('task_scheduler.management.commands.sync_tasks.ScheduledTaskDiscovery.discover_app_tasks')
    @patch('task_scheduler.management.commands.sync_tasks.ScheduledTaskSynchronizer.sync_tasks')
    def test_sync_tasks_invalid_app(self, mock_sync, mock_discover):
        with patch('django.conf.settings.LOCAL_APPS', ['valid_app']):
            call_command('sync_tasks', app='invalid_app')

        mock_discover.assert_not_called()
        mock_sync.assert_not_called()

    @patch('task_scheduler.management.commands.sync_tasks.ScheduledTaskDiscovery.discover_all_tasks')
    @patch('task_scheduler.management.commands.sync_tasks.ScheduledTaskSynchronizer.sync_tasks')
    def test_sync_tasks_no_tasks_discovered(self, mock_sync, mock_discover):
        mock_discover.return_value = {}

        call_command('sync_tasks')

        mock_discover.assert_called_once()
        mock_sync.assert_not_called()

    @patch('task_scheduler.management.commands.sync_tasks.ScheduledTaskDiscovery.discover_all_tasks')
    @patch('task_scheduler.management.commands.sync_tasks.ScheduledTaskSynchronizer.sync_tasks')
    def test_sync_tasks_dry_run(self, mock_sync, mock_discover):
        mock_discover.return_value = self.mock_discovered_tasks

        call_command('sync_tasks', dry_run=True)

        mock_discover.assert_called_once()
        mock_sync.assert_not_called()

    @patch('task_scheduler.management.commands.sync_tasks.ScheduledTaskDiscovery.discover_app_tasks')
    def test_sync_tasks_dry_run_specific_app(self, mock_discover):
        mock_discover.return_value = self.mock_discovered_tasks

        with patch('django.conf.settings.LOCAL_APPS', ['test_app']):
            call_command('sync_tasks', app='test_app', dry_run=True)

        mock_discover.assert_called_once_with('test_app')
