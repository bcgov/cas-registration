from unittest.mock import patch
from django.test import TestCase
from django.core.management import call_command
from django.core.management.base import CommandError
import pytest


class TestCleanupTasksCommand(TestCase):
    def test_cleanup_tasks_default_behavior(self):
        with patch('task_scheduler.service.task_service.TaskService.cleanup_old_tasks') as mock_cleanup:
            mock_cleanup.return_value = 3
            call_command('cleanup_tasks')
        mock_cleanup.assert_called_once_with(days=30)

    def test_cleanup_tasks_with_custom_days(self):
        with patch('task_scheduler.service.task_service.TaskService.cleanup_old_tasks') as mock_cleanup:
            mock_cleanup.return_value = 2
            call_command('cleanup_tasks', days=7)
        mock_cleanup.assert_called_once_with(days=7)

    def test_cleanup_tasks_rejects_zero_days(self):
        with pytest.raises(CommandError, match="Days must be a positive integer greater than 0"):
            call_command('cleanup_tasks', days=0)

    def test_cleanup_tasks_rejects_negative_days(self):
        with pytest.raises(CommandError, match="Days must be a positive integer greater than 0"):
            call_command('cleanup_tasks', days=-5)
