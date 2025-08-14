from unittest.mock import patch, Mock
from django.test import SimpleTestCase
from django.core.management import call_command
from io import StringIO


class TestRunTasksCommand(SimpleTestCase):
    def setUp(self):
        self.mock_task1 = Mock()
        self.mock_task1.function_path = "test.module.function1"

        self.mock_task2 = Mock()
        self.mock_task2.function_path = "test.module.function2"
        self.mock_tasks = [self.mock_task1, self.mock_task2]

    @patch('task_scheduler.service.task_service.TaskService.process_task')
    @patch('task_scheduler.service.task_service.TaskService.get_due_tasks')
    def test_run_tasks_command_success(self, mock_get_due_tasks, mock_process):
        mock_get_due_tasks.return_value = [self.mock_task1]
        mock_process.return_value = True

        out = StringIO()
        call_command('run_tasks', stdout=out)

        mock_get_due_tasks.assert_called_once_with(None)

        output = out.getvalue()
        self.assertIn("Processing 1 due tasks", output)
        self.assertIn("Processing completed: 1 processed, 1 successful, 0 failed", output)

    @patch('task_scheduler.service.task_service.TaskService.process_task')
    @patch('task_scheduler.service.task_service.TaskService.get_due_tasks')
    def test_run_tasks_command_no_due_tasks(self, mock_get_due_tasks, mock_process):
        mock_get_due_tasks.return_value = []

        out = StringIO()
        call_command('run_tasks', stdout=out)

        mock_get_due_tasks.assert_called_once_with(None)

        mock_process.assert_not_called()

        output = out.getvalue()
        self.assertIn("No due tasks found", output)

    @patch('task_scheduler.service.task_service.TaskService.process_task')
    @patch('task_scheduler.service.task_service.TaskService.get_due_tasks')
    def test_run_tasks_command_with_tag_filter(self, mock_get_due_tasks, mock_process):
        mock_get_due_tasks.return_value = [self.mock_task1]
        mock_process.return_value = True

        out = StringIO()
        call_command('run_tasks', tag='test_tag', stdout=out)

        mock_get_due_tasks.assert_called_once_with('test_tag')

        output = out.getvalue()
        self.assertIn("Processing 1 due tasks", output)
        self.assertIn("Processing completed: 1 processed, 1 successful, 0 failed", output)

    @patch('task_scheduler.service.task_service.TaskService.process_task')
    @patch('task_scheduler.service.task_service.TaskService.get_due_tasks')
    def test_run_tasks_command_task_failure(self, mock_get_due_tasks, mock_process):
        mock_get_due_tasks.return_value = [self.mock_task1]
        mock_process.return_value = False

        out = StringIO()
        call_command('run_tasks', stdout=out)

        mock_get_due_tasks.assert_called_once_with(None)

        output = out.getvalue()
        self.assertIn("Processing 1 due tasks", output)
        self.assertIn("Processing completed: 1 processed, 0 successful, 1 failed", output)

    @patch('task_scheduler.service.task_service.TaskService.process_task')
    @patch('task_scheduler.service.task_service.TaskService.get_due_tasks')
    def test_run_tasks_command_mixed_results(self, mock_get_due_tasks, mock_process):
        mock_get_due_tasks.return_value = self.mock_tasks
        # First task succeeds, second fails
        mock_process.side_effect = [True, False]

        out = StringIO()
        call_command('run_tasks', stdout=out)

        mock_get_due_tasks.assert_called_once_with(None)

        output = out.getvalue()
        self.assertIn("Processing 2 due tasks", output)
        self.assertIn("Processing completed: 2 processed, 1 successful, 1 failed", output)

    @patch('task_scheduler.service.task_service.TaskService.process_task')
    @patch('task_scheduler.service.task_service.TaskService.get_due_tasks')
    def test_run_tasks_command_exception_handling(self, mock_get_due_tasks, mock_process):
        mock_get_due_tasks.return_value = [self.mock_task1]
        mock_process.side_effect = Exception("Unexpected error")

        out = StringIO()
        call_command('run_tasks', stdout=out)

        mock_get_due_tasks.assert_called_once_with(None)

        output = out.getvalue()
        self.assertIn("Error processing task test.module.function1: Unexpected error", output)

    @patch('task_scheduler.service.task_service.TaskService.process_task')
    @patch('task_scheduler.service.task_service.TaskService.get_due_tasks')
    def test_run_tasks_command_verbose_output(self, mock_get_due_tasks, mock_process):
        mock_get_due_tasks.return_value = [self.mock_task1]
        mock_process.return_value = True

        out = StringIO()
        call_command('run_tasks', verbose=True, stdout=out)

        mock_get_due_tasks.assert_called_once_with(None)

        output = out.getvalue()
        self.assertIn("Processing Scheduled task: test.module.function1", output)

    @patch('task_scheduler.service.task_service.TaskService.process_task')
    @patch('task_scheduler.service.task_service.TaskService.get_due_tasks')
    def test_run_tasks_command_dry_run(self, mock_get_due_tasks, mock_process):
        mock_get_due_tasks.return_value = self.mock_tasks

        out = StringIO()
        call_command('run_tasks', dry_run=True, stdout=out)

        mock_get_due_tasks.assert_called_once_with(None)

        mock_process.assert_not_called()

        output = out.getvalue()
        self.assertIn("DRY RUN MODE", output)
        self.assertIn("Would process 2 tasks", output)
