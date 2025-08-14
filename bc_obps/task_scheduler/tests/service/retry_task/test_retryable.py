from unittest.mock import MagicMock, patch
from django.test import SimpleTestCase, TestCase
from model_bakery import baker
from task_scheduler.service.retry_task.retryable import RetryableFunction, create_retry_task
from task_scheduler.models import RetryTask


class TestRetryableFunction(SimpleTestCase):
    def setUp(self):
        self.mock_func = MagicMock()
        self.mock_func.__name__ = 'test_function'

    def test_retryable_function_creation(self):
        retryable = RetryableFunction(func=self.mock_func, tag='test_tag', max_retries=5, retry_delay_minutes=10)

        self.assertEqual(retryable.func, self.mock_func)
        self.assertEqual(retryable.tag, 'test_tag')
        self.assertEqual(retryable.max_retries, 5)
        self.assertEqual(retryable.retry_delay_minutes, 10)

    def test_retryable_function_default_values(self):
        retryable = RetryableFunction(func=self.mock_func)

        self.assertEqual(retryable.func, self.mock_func)
        self.assertEqual(retryable.tag, '')
        self.assertEqual(retryable.max_retries, 3)
        self.assertEqual(retryable.retry_delay_minutes, 5)

    @patch('task_scheduler.service.retry_task.retryable.create_retry_task')
    def test_execute_success(self, mock_create_retry):
        self.mock_func.return_value = 'success_result'

        retryable = RetryableFunction(func=self.mock_func)
        result = retryable.execute('arg1', 'arg2', kwarg1='value1')

        self.assertEqual(result, 'success_result')
        self.mock_func.assert_called_once_with('arg1', 'arg2', kwarg1='value1')
        mock_create_retry.assert_not_called()

    @patch('task_scheduler.service.retry_task.retryable.create_retry_task')
    @patch('task_scheduler.service.retry_task.retryable.extract_function_parameters')
    @patch('task_scheduler.service.retry_task.retryable.get_function_path')
    def test_execute_failure(self, mock_get_path, mock_extract_params, mock_create_retry):
        self.mock_func.side_effect = Exception("Test error")
        mock_extract_params.return_value = {'kwarg1': 'value1'}
        mock_get_path.return_value = 'test.module.function'

        retryable = RetryableFunction(func=self.mock_func, tag='test_tag')
        result = retryable.execute(kwarg1='value1')

        self.assertIsNone(result)
        mock_create_retry.assert_called_once_with(
            function_path='test.module.function',
            kwargs={'kwarg1': 'value1'},
            tag='test_tag',
            max_retries=3,
            retry_delay_minutes=5,
        )


class TestCreateRetryTask(TestCase):
    def test_create_retry_task_new_task(self):
        result = create_retry_task(
            function_path='test.module.function',
            kwargs={'param': 'value'},
            tag='test_tag',
            max_retries=5,
            retry_delay_minutes=10,
        )

        self.assertIsInstance(result, RetryTask)
        self.assertEqual(result.function_path, 'test.module.function')
        self.assertEqual(result.kwargs, {'param': 'value'})
        self.assertEqual(result.tag, 'test_tag')
        self.assertEqual(result.max_retries, 5)
        self.assertEqual(result.retry_delay_minutes, 10)
        self.assertEqual(result.status, RetryTask.Status.PENDING)

    def test_create_retry_task_existing_failed_task(self):
        existing_task = baker.make_recipe(
            "task_scheduler.tests.utils.retry_task",
            function_path='test.module.function',
            status=RetryTask.Status.FAILED,
            retry_count=1,
            kwargs={'param': 'value'},
            tag='test_tag',
        )

        # Try to create another task with same parameters
        result = create_retry_task(function_path='test.module.function', kwargs={'param': 'value'}, tag='test_tag')

        # Should return the existing task and update it
        self.assertEqual(result, existing_task)
        existing_task.refresh_from_db()
        self.assertEqual(existing_task.retry_count, 2)

    def test_create_retry_task_existing_completed_task(self):
        existing_task = baker.make_recipe(
            "task_scheduler.tests.utils.retry_task",
            function_path='test.module.function',
            status=RetryTask.Status.COMPLETED,
            kwargs={'param': 'value'},
            tag='test_tag',
        )

        # Try to create another task with same parameters
        result = create_retry_task(function_path='test.module.function', kwargs={'param': 'value'}, tag='test_tag')

        # Should create a new task since existing one is completed
        self.assertNotEqual(result, existing_task)
        self.assertIsInstance(result, RetryTask)
        self.assertEqual(result.function_path, 'test.module.function')
        self.assertEqual(result.status, RetryTask.Status.PENDING)
        # Should have 2 tasks now
        self.assertEqual(RetryTask.objects.filter(function_path='test.module.function').count(), 2)

    def test_create_retry_task_existing_running_task(self):
        # Create a running task first with matching kwargs
        existing_task = baker.make_recipe(
            "task_scheduler.tests.utils.retry_task",
            function_path='test.module.function',
            status=RetryTask.Status.RUNNING,
            kwargs={'param': 'value'},
            tag='test_tag',
        )

        # Try to create another task with same parameters
        result = create_retry_task(function_path='test.module.function', kwargs={'param': 'value'}, tag='test_tag')

        # Should return existing task without creating new one
        self.assertEqual(result, existing_task)
        # Should not create a new task
        self.assertEqual(RetryTask.objects.filter(function_path='test.module.function').count(), 1)

    def test_create_retry_task_existing_failed_task_exhausted_retries(self):
        # Create a failed task that has exhausted retries with matching kwargs
        existing_task = baker.make_recipe(
            "task_scheduler.tests.utils.retry_task",
            function_path='test.module.function',
            status=RetryTask.Status.FAILED,
            retry_count=3,
            max_retries=3,
            kwargs={'param': 'value'},
            tag='test_tag',
        )

        # Try to create another task with same parameters
        result = create_retry_task(function_path='test.module.function', kwargs={'param': 'value'}, tag='test_tag')

        # Should return existing task without updating it
        self.assertEqual(result, existing_task)
        existing_task.refresh_from_db()
        self.assertEqual(existing_task.retry_count, 3)  # Should not be incremented
