from unittest.mock import MagicMock
from django.test import SimpleTestCase
from task_scheduler.service.retry_task.factories import create_retryable


class TestFactories(SimpleTestCase):
    def test_create_retryable_default_values(self):
        mock_func = MagicMock()

        retryable = create_retryable(func=mock_func)

        self.assertEqual(retryable.func, mock_func)
        self.assertEqual(retryable.max_retries, 3)  # Default value
        self.assertEqual(retryable.retry_delay_minutes, 5)  # Default value

    def test_create_retryable_custom_values(self):
        mock_func = MagicMock()

        retryable = create_retryable(func=mock_func, max_retries=5, retry_delay_minutes=120)

        self.assertEqual(retryable.func, mock_func)
        self.assertEqual(retryable.max_retries, 5)
        self.assertEqual(retryable.retry_delay_minutes, 120)

    def test_create_retryable_function_attributes(self):
        mock_func = MagicMock()
        mock_func.__name__ = 'test_function'
        mock_func.__doc__ = 'Test function documentation'

        retryable = create_retryable(func=mock_func)

        # Should preserve function attributes
        self.assertEqual(retryable.func.__name__, 'test_function')
        self.assertEqual(retryable.func.__doc__, 'Test function documentation')
