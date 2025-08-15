from unittest.mock import patch, MagicMock
from django.test import SimpleTestCase
from task_scheduler.service.scheduled_task.discovery import ScheduledTaskDiscovery
from task_scheduler.service.scheduled_task.dataclass import ScheduledTaskConfig


class TestScheduledTaskDiscovery(SimpleTestCase):
    def setUp(self):
        self.mock_task_config = MagicMock(spec=ScheduledTaskConfig)
        self.mock_task_config.func = MagicMock()
        self.mock_task_config.func.__name__ = 'test_function'
        self.mock_task_config.func.__module__ = 'test.module'
        self.mock_task_config.to_dict.return_value = {
            'schedule_type': 'daily',
            'tag': 'test_tag',
            'schedule_hour': 10,
            'schedule_minute': 30,
        }

    def test_discover_app_tasks_no_tasks_file(self):
        with patch('task_scheduler.service.scheduled_task.discovery.os.path.exists', return_value=False):
            result = ScheduledTaskDiscovery.discover_app_tasks('test_app')
            self.assertEqual(result, {})

    def test_discover_app_tasks_success(self):
        mock_module = MagicMock()
        mock_module.SCHEDULED_TASKS = [self.mock_task_config]

        with patch('task_scheduler.service.scheduled_task.discovery.os.path.exists', return_value=True):
            with patch(
                'task_scheduler.service.scheduled_task.discovery.importlib.import_module', return_value=mock_module
            ):
                with patch(
                    'task_scheduler.service.scheduled_task.discovery.get_function_path',
                    return_value='test.module.test_function',
                ):
                    result = ScheduledTaskDiscovery.discover_app_tasks('test_app')

                    self.assertIsInstance(result, dict)
                    self.assertIn('test.module.test_function', result)
                    self.assertEqual(result['test.module.test_function'], self.mock_task_config.to_dict.return_value)

    def test_discover_app_tasks_no_scheduled_tasks(self):
        mock_module = MagicMock()
        mock_module.SCHEDULED_TASKS = None

        with patch('task_scheduler.service.scheduled_task.discovery.os.path.exists', return_value=True):
            with patch(
                'task_scheduler.service.scheduled_task.discovery.importlib.import_module', return_value=mock_module
            ):
                result = ScheduledTaskDiscovery.discover_app_tasks('test_app')
                self.assertEqual(result, {})

    def test_discover_app_tasks_invalid_config_type(self):
        mock_module = MagicMock()
        mock_module.SCHEDULED_TASKS = ["invalid_type", 123, {}]

        with patch('task_scheduler.service.scheduled_task.discovery.os.path.exists', return_value=True):
            with patch(
                'task_scheduler.service.scheduled_task.discovery.importlib.import_module', return_value=mock_module
            ):
                result = ScheduledTaskDiscovery.discover_app_tasks('test_app')
                self.assertEqual(result, {})

    def test_discover_app_tasks_mixed_valid_and_invalid_configs(self):
        mock_module = MagicMock()
        mock_module.SCHEDULED_TASKS = [self.mock_task_config, "invalid_type"]

        with patch('task_scheduler.service.scheduled_task.discovery.os.path.exists', return_value=True):
            with patch(
                'task_scheduler.service.scheduled_task.discovery.importlib.import_module', return_value=mock_module
            ):
                with patch(
                    'task_scheduler.service.scheduled_task.discovery.get_function_path',
                    return_value='test.module.test_function',
                ):
                    result = ScheduledTaskDiscovery.discover_app_tasks('test_app')

                    # Should only include valid configs
                    self.assertEqual(len(result), 1)
                    self.assertIn('test.module.test_function', result)

    def test_discover_app_tasks_app_directory_not_found(self):
        with patch('task_scheduler.service.scheduled_task.discovery.os.path.exists', return_value=False):
            with patch('task_scheduler.service.scheduled_task.discovery.logger.warning') as mock_warning:
                result = ScheduledTaskDiscovery.discover_app_tasks('nonexistent_app')

                self.assertEqual(result, {})
                mock_warning.assert_called_once()

    def test_discover_all_tasks_multiple_apps(self):
        with patch('task_scheduler.service.scheduled_task.discovery.getattr') as mock_getattr:
            mock_getattr.return_value = ['app1', 'app2']

            with patch.object(ScheduledTaskDiscovery, 'discover_app_tasks') as mock_discover:
                mock_discover.side_effect = [{'app1.task1': {'tag': 'app1'}}, {'app2.task2': {'tag': 'app2'}}]

                result = ScheduledTaskDiscovery.discover_all_tasks()

                self.assertEqual(len(result), 2)
                self.assertIn('app1.task1', result)
                self.assertIn('app2.task2', result)
                self.assertEqual(mock_discover.call_count, 2)

    def test_import_tasks_module_success(self):
        mock_module = MagicMock()
        mock_module.SCHEDULED_TASKS = [self.mock_task_config]

        with patch('task_scheduler.service.scheduled_task.discovery.importlib.import_module', return_value=mock_module):
            with patch(
                'task_scheduler.service.scheduled_task.discovery.get_function_path',
                return_value='test.module.test_function',
            ):
                result = ScheduledTaskDiscovery.import_tasks_module('test_app.tasks')

                self.assertIsInstance(result, dict)
                self.assertIn('test.module.test_function', result)
                self.assertEqual(result['test.module.test_function'], self.mock_task_config.to_dict.return_value)
