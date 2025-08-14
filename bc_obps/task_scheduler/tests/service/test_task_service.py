from unittest.mock import patch, MagicMock
from django.test import TestCase
from django.utils import timezone
from datetime import timedelta
from model_bakery import baker
from task_scheduler.service.task_service import TaskService
from task_scheduler.models import ScheduledTask, RetryTask


class TestTaskService(TestCase):
    def setUp(self):
        self.scheduled_task = baker.make_recipe(
            "task_scheduler.tests.utils.scheduled_task", next_run_time=timezone.now() - timedelta(minutes=1)
        )

        self.retry_task = baker.make_recipe(
            "task_scheduler.tests.utils.retry_task",
            function_path="test.module.retry_function",
            next_run_time=timezone.now() - timedelta(minutes=1),
            tag="another_test",
        )

    def test_get_due_tasks_with_tag(self):
        due_tasks = TaskService.get_due_tasks("test")
        self.assertEqual(len(due_tasks), 1)
        self.assertIn(self.scheduled_task, due_tasks)

    def test_get_due_tasks_no_tag(self):
        due_tasks = TaskService.get_due_tasks()
        self.assertEqual(len(due_tasks), 2)
        self.assertIn(self.scheduled_task, due_tasks)
        self.assertIn(self.retry_task, due_tasks)

    def test_get_due_tasks_no_due_tasks(self):
        # Set tasks to future times
        self.scheduled_task.next_run_time = timezone.now() + timedelta(hours=1)
        self.scheduled_task.save()
        self.retry_task.next_run_time = timezone.now() + timedelta(hours=1)
        self.retry_task.save()

        due_tasks = TaskService.get_due_tasks()
        self.assertEqual(len(due_tasks), 0)

    def test_get_due_tasks_different_statuses_scheduled_task(self):
        # Test PENDING status
        self.scheduled_task.status = ScheduledTask.Status.PENDING
        self.scheduled_task.save()
        due_tasks = TaskService.get_due_tasks()
        self.assertIn(self.scheduled_task, due_tasks)

        # Test FAILED status
        self.scheduled_task.status = ScheduledTask.Status.FAILED
        self.scheduled_task.save()
        due_tasks = TaskService.get_due_tasks()
        self.assertIn(self.scheduled_task, due_tasks)

        # Test COMPLETED status
        self.scheduled_task.status = ScheduledTask.Status.COMPLETED
        self.scheduled_task.save()
        due_tasks = TaskService.get_due_tasks()
        self.assertIn(self.scheduled_task, due_tasks)

        # Test INACTIVE status (should not be included)
        self.scheduled_task.status = ScheduledTask.Status.INACTIVE
        self.scheduled_task.save()
        due_tasks = TaskService.get_due_tasks()
        self.assertNotIn(self.scheduled_task, due_tasks)

    def test_get_due_tasks_different_statuses_retry_task(self):
        # Test PENDING status
        self.retry_task.status = RetryTask.Status.PENDING
        self.retry_task.save()
        due_tasks = TaskService.get_due_tasks()
        self.assertIn(self.retry_task, due_tasks)

        # Test FAILED status
        self.retry_task.status = RetryTask.Status.FAILED
        self.retry_task.save()
        due_tasks = TaskService.get_due_tasks()
        self.assertIn(self.retry_task, due_tasks)

        # Test COMPLETED status (should not be included)
        self.retry_task.status = RetryTask.Status.COMPLETED
        self.retry_task.save()
        due_tasks = TaskService.get_due_tasks()
        self.assertNotIn(self.retry_task, due_tasks)

    def test_get_due_tasks_retry_task_cannot_retry(self):
        # Retry task that has exhausted retries
        exhausted_retry_task_obj = baker.make_recipe(
            "task_scheduler.tests.utils.retry_task",
            function_path="exhausted.retry.function",
            status=RetryTask.Status.FAILED,
            retry_count=3,
            max_retries=3,
            next_run_time=timezone.now() - timedelta(minutes=1),
        )

        due_tasks = TaskService.get_due_tasks()
        self.assertNotIn(exhausted_retry_task_obj, due_tasks)

    @patch('task_scheduler.service.task_service.resolve_function_from_path')
    def test_process_task_success(self, mock_resolve):
        mock_function = MagicMock()
        mock_resolve.return_value = mock_function

        with patch.object(self.scheduled_task, 'mark_attempt_started') as mock_started, patch.object(
            self.scheduled_task, 'mark_attempt_success'
        ) as mock_success, patch.object(self.scheduled_task, 'calculate_next_run_time') as mock_calc_next, patch.object(
            self.scheduled_task, 'release_lock'
        ) as mock_release:

            mock_calc_next.return_value = timezone.now() + timedelta(hours=1)

            result = TaskService.process_task(self.scheduled_task)

            self.assertTrue(result)
            mock_started.assert_called_once()
            mock_success.assert_called_once()
            mock_calc_next.assert_called_once()
            mock_release.assert_called_once()

    @patch('task_scheduler.service.task_service.resolve_function_from_path')
    def test_process_task_failure(self, mock_resolve):
        mock_resolve.side_effect = Exception("Task failed")

        with patch.object(self.scheduled_task, 'mark_attempt_started') as mock_started, patch.object(
            self.scheduled_task, 'mark_attempt_failed'
        ) as mock_failed, patch.object(self.scheduled_task, 'calculate_next_run_time') as mock_calc_next, patch.object(
            self.scheduled_task, 'release_lock'
        ) as mock_release, patch.object(
            self.scheduled_task, 'mark_attempt_success'
        ) as mock_success:

            mock_calc_next.return_value = timezone.now() + timedelta(hours=1)

            result = TaskService.process_task(self.scheduled_task)

            self.assertFalse(result)

            mock_started.assert_called_once()
            mock_failed.assert_called_once_with("Task failed")
            mock_calc_next.assert_called_once()
            mock_release.assert_called_once()
            mock_success.assert_not_called()

    def test_process_task_already_locked(self):
        self.scheduled_task.acquire_lock()
        result = TaskService.process_task(self.scheduled_task)
        self.assertFalse(result)

    def test_process_retry_task_success(self):
        with patch.object(TaskService, 'execute_task_function', return_value=True), patch.object(
            self.retry_task, 'mark_attempt_started'
        ) as mock_started, patch.object(self.retry_task, 'mark_attempt_success') as mock_success, patch.object(
            self.retry_task, 'calculate_next_run_time'
        ) as mock_calc_next, patch.object(
            self.retry_task, 'release_lock'
        ) as mock_release:

            mock_calc_next.return_value = timezone.now() + timedelta(hours=1)

            result = TaskService.process_task(self.retry_task)

            self.assertTrue(result)

            mock_started.assert_called_once()
            mock_success.assert_called_once()
            mock_calc_next.assert_called_once()
            mock_release.assert_called_once()

    def test_process_retry_task_failure(self):
        with patch.object(TaskService, 'execute_task_function', side_effect=Exception("Task failed")), patch.object(
            self.retry_task, 'mark_attempt_started'
        ) as mock_started, patch.object(self.retry_task, 'mark_attempt_failed') as mock_failed, patch.object(
            self.retry_task, 'calculate_next_run_time'
        ) as mock_calc_next, patch.object(
            self.retry_task, 'release_lock'
        ) as mock_release, patch.object(
            self.scheduled_task, 'mark_attempt_success'
        ) as mock_success:

            mock_calc_next.return_value = timezone.now() + timedelta(hours=1)

            result = TaskService.process_task(self.retry_task)

            self.assertFalse(result)

            mock_started.assert_called_once()
            mock_failed.assert_called_once_with("Task failed")
            mock_calc_next.assert_called_once()
            mock_release.assert_called_once()
            mock_success.assert_not_called()

    def test_execute_task_function_scheduled_task(self):
        with patch('task_scheduler.service.task_service.resolve_function_from_path') as mock_resolve:
            mock_function = MagicMock()
            mock_function.return_value = "success"
            mock_resolve.return_value = mock_function

            result = TaskService.execute_task_function(self.scheduled_task)

            self.assertEqual(result, "success")
            mock_resolve.assert_called_once_with(self.scheduled_task.function_path)
            mock_function.assert_called_once_with()

    def test_execute_task_function_retry_task(self):
        with patch('task_scheduler.service.task_service.resolve_function_from_path') as mock_resolve:
            mock_function = MagicMock()
            mock_function.return_value = "success"
            mock_resolve.return_value = mock_function

            result = TaskService.execute_task_function(self.retry_task)

            self.assertEqual(result, "success")
            mock_resolve.assert_called_once_with(self.retry_task.function_path)
            mock_function.assert_called_once_with(**self.retry_task.kwargs)

    def test_cleanup_old_tasks(self):
        old_completed_task = baker.make_recipe(
            "task_scheduler.tests.utils.scheduled_task",
            function_path="old.completed.function",
            status=ScheduledTask.Status.COMPLETED,
            last_run_time=timezone.now() - timedelta(days=35),
        )
        old_inactive_task = baker.make_recipe(
            "task_scheduler.tests.utils.scheduled_task",
            function_path="old.inactive.function",
            status=ScheduledTask.Status.INACTIVE,
            last_run_time=timezone.now() - timedelta(days=35),
        )
        old_retry_task_obj = baker.make_recipe(
            "task_scheduler.tests.utils.retry_task",
            function_path="old.retry.function",
            status=RetryTask.Status.COMPLETED,
            last_run_time=timezone.now() - timedelta(days=35),
        )

        # Recent tasks that shouldn't be deleted
        recent_task = baker.make_recipe(
            "task_scheduler.tests.utils.scheduled_task",
            function_path="recent.function",
            status=ScheduledTask.Status.COMPLETED,
            last_run_time=timezone.now() - timedelta(days=15),
        )

        deleted_count = TaskService.cleanup_old_tasks(days=30)
        self.assertEqual(deleted_count, 3)  # 3 old tasks deleted

        self.assertFalse(ScheduledTask.objects.filter(pk=old_completed_task.pk).exists())
        self.assertFalse(ScheduledTask.objects.filter(pk=old_inactive_task.pk).exists())
        self.assertFalse(RetryTask.objects.filter(pk=old_retry_task_obj.pk).exists())
        self.assertTrue(ScheduledTask.objects.filter(pk=recent_task.pk).exists())
