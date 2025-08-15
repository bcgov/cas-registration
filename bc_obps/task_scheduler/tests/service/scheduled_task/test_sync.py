from unittest.mock import patch
from django.test import TestCase
from django.utils import timezone
from datetime import timedelta
from model_bakery import baker
from task_scheduler.service.scheduled_task.sync import ScheduledTaskSynchronizer
from task_scheduler.models import ScheduledTask


class TestScheduledTaskSynchronizer(TestCase):
    def setUp(self):
        self.discovered_tasks = {
            'test.module.function1': {
                'schedule_type': 'daily',
                'tag': 'test_tag1',
                'schedule_hour': 10,
                'schedule_minute': 30,
            },
            'test.module.function2': {'schedule_type': 'hourly', 'tag': 'test_tag2'},
        }

        self.existing_task = baker.make_recipe(
            "task_scheduler.tests.utils.scheduled_task",
            function_path='test.module.function1',
            schedule_type=ScheduledTask.ScheduleType.HOURLY,
            tag='old_tag',
        )

    def test_sync_tasks(self):
        with patch.object(ScheduledTask.objects, 'all', return_value=[]):
            with patch.object(ScheduledTask, 'calculate_next_run_time') as mock_calc:
                mock_calc.return_value = timezone.now() + timedelta(hours=1)

                with patch.object(ScheduledTaskSynchronizer, '_process_discovered_tasks') as mock_process:
                    with patch.object(ScheduledTaskSynchronizer, '_deactivate_removed_tasks') as mock_deactivate:
                        mock_process.return_value = (2, 0)  # (created, updated)
                        mock_deactivate.return_value = 0

                        result = ScheduledTaskSynchronizer.sync_tasks(self.discovered_tasks)

                        self.assertIsInstance(result, dict)
                        self.assertIn('created', result)
                        self.assertIn('updated', result)
                        self.assertIn('deactivated', result)
                        self.assertEqual(result['created'], 2)
                        self.assertEqual(result['updated'], 0)
                        self.assertEqual(result['deactivated'], 0)
                        mock_process.assert_called_once()
                        mock_deactivate.assert_called_once()

    def test_process_discovered_tasks(self):
        existing_tasks = {self.existing_task.function_path: self.existing_task}

        with patch.object(ScheduledTaskSynchronizer, '_handle_existing_task') as mock_handle:
            with patch.object(ScheduledTaskSynchronizer, '_create_new_task') as mock_create:
                mock_handle.return_value = 1
                mock_create.return_value = True

                result = ScheduledTaskSynchronizer._process_discovered_tasks(self.discovered_tasks, existing_tasks)

                self.assertEqual(result, (1, 1))  # (created, updated)
                mock_handle.assert_called_once()
                mock_create.assert_called_once()

    def test_handle_existing_task(self):
        task_config = self.discovered_tasks['test.module.function1']

        with patch.object(ScheduledTaskSynchronizer, '_update_task_if_needed') as mock_update:
            with patch.object(ScheduledTaskSynchronizer, '_activate_task_if_needed') as mock_activate:
                mock_update.return_value = True

                result = ScheduledTaskSynchronizer._handle_existing_task(self.existing_task, task_config)

                self.assertEqual(result, 1)
                mock_update.assert_called_once_with(self.existing_task, task_config)
                mock_activate.assert_called_once_with(self.existing_task)

    def test_update_task_if_needed(self):
        task_config = {
            'schedule_type': 'daily',
            'tag': 'new_tag',
            'schedule_hour': 15,
            'schedule_minute': 45,
        }

        with patch.object(self.existing_task, 'calculate_next_run_time') as mock_calc:
            with patch.object(self.existing_task, 'save') as mock_save:
                mock_calc.return_value = timezone.now() + timedelta(hours=1)

                result = ScheduledTaskSynchronizer._update_task_if_needed(self.existing_task, task_config)

                self.assertTrue(result)
                self.assertEqual(self.existing_task.schedule_type, 'daily')
                self.assertEqual(self.existing_task.tag, 'new_tag')
                self.assertEqual(self.existing_task.schedule_hour, 15)
                self.assertEqual(self.existing_task.schedule_minute, 45)
                mock_calc.assert_called_once_with(force_recalculate=True)
                mock_save.assert_called_once()

    def test_update_task_if_needed_no_changes(self):
        self.existing_task.schedule_type = 'daily'
        self.existing_task.tag = 'test_tag1'
        self.existing_task.schedule_hour = 10
        self.existing_task.schedule_minute = 30
        self.existing_task.schedule_interval = None
        self.existing_task.schedule_day_of_week = None
        self.existing_task.schedule_day_of_month = None
        self.existing_task.save()

        task_config = {
            'schedule_type': 'daily',
            'tag': 'test_tag1',
            'schedule_hour': 10,
            'schedule_minute': 30,
            'schedule_interval': None,
            'schedule_day_of_week': None,
            'schedule_day_of_month': None,
        }

        with patch.object(self.existing_task, 'calculate_next_run_time') as mock_calc:
            with patch.object(self.existing_task, 'save') as mock_save:

                result = ScheduledTaskSynchronizer._update_task_if_needed(self.existing_task, task_config)

                self.assertFalse(result)
                mock_calc.assert_not_called()
                mock_save.assert_not_called()

    def test_activate_task_if_needed(self):
        self.existing_task.status = ScheduledTask.Status.INACTIVE
        self.existing_task.save()

        with patch.object(self.existing_task, 'save') as mock_save:
            ScheduledTaskSynchronizer._activate_task_if_needed(self.existing_task)

            self.assertEqual(self.existing_task.status, ScheduledTask.Status.PENDING)
            mock_save.assert_called_once_with(update_fields=['status'])

    def test_activate_task_if_needed_already_active(self):
        self.existing_task.status = ScheduledTask.Status.PENDING
        self.existing_task.save()

        with patch.object(self.existing_task, 'save') as mock_save:
            ScheduledTaskSynchronizer._activate_task_if_needed(self.existing_task)

            self.assertEqual(self.existing_task.status, ScheduledTask.Status.PENDING)
            mock_save.assert_not_called()

    def test_create_new_task(self):
        function_path = 'test.module.new_function'
        task_config = {
            'schedule_type': 'weekly',
            'tag': 'new_tag',
            'schedule_day_of_week': 1,
            'schedule_hour': 9,
            'schedule_minute': 0,
        }

        with patch.object(ScheduledTask, 'calculate_next_run_time') as mock_calc:
            with patch.object(ScheduledTask, 'save') as mock_save:
                mock_calc.return_value = timezone.now() + timedelta(days=1)

                result = ScheduledTaskSynchronizer._create_new_task(function_path, task_config)

                self.assertTrue(result)
                mock_calc.assert_called_once()
                mock_save.assert_called_once()

    def test_deactivate_removed_tasks(self):
        # Create a task that won't be in discovered_tasks
        removed_task = baker.make_recipe(
            "task_scheduler.tests.utils.scheduled_task",
            function_path='test.module.removed_function',
            status=ScheduledTask.Status.PENDING,
        )

        existing_tasks = {
            self.existing_task.function_path: self.existing_task,
            removed_task.function_path: removed_task,
        }

        result = ScheduledTaskSynchronizer._deactivate_removed_tasks(self.discovered_tasks, existing_tasks)

        self.assertEqual(result, 1)
        removed_task.refresh_from_db()
        self.assertEqual(removed_task.status, ScheduledTask.Status.INACTIVE)

    def test_sync_tasks_integration_flow(self):
        with patch.object(ScheduledTask.objects, 'all', return_value=[self.existing_task]):
            with patch.object(ScheduledTask, 'calculate_next_run_time') as mock_calc:
                mock_calc.return_value = timezone.now() + timedelta(hours=1)

                result = ScheduledTaskSynchronizer.sync_tasks(self.discovered_tasks)

                self.assertIsInstance(result, dict)
                self.assertEqual(result['created'], 1)  # function2 is new
                self.assertEqual(result['updated'], 1)  # function1 gets updated
                self.assertEqual(result['deactivated'], 0)  # no tasks removed
