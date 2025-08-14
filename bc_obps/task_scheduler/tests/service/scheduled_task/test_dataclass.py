from unittest.mock import MagicMock
from django.test import SimpleTestCase
from task_scheduler.service.scheduled_task.dataclass import ScheduledTaskConfig


class TestScheduledTaskConfig(SimpleTestCase):
    def test_scheduled_task_config_default_values(self):
        mock_func = MagicMock()
        config = ScheduledTaskConfig(func=mock_func, schedule_type='hourly', schedule_interval=2)

        self.assertEqual(config.func, mock_func)
        self.assertEqual(config.schedule_type, 'hourly')
        self.assertEqual(config.schedule_interval, 2)
        self.assertIsNone(config.tag)
        self.assertIsNone(config.schedule_hour)
        self.assertIsNone(config.schedule_minute)
        self.assertIsNone(config.schedule_day_of_week)
        self.assertIsNone(config.schedule_day_of_month)

    def test_scheduled_task_config_to_dict(self):
        mock_func = MagicMock()
        config = ScheduledTaskConfig(
            func=mock_func,
            schedule_type='weekly',
            tag='weekly_task',
            schedule_hour=14,
            schedule_minute=30,
            schedule_day_of_week=1,
        )

        result = config.to_dict()

        expected = {
            'schedule_type': 'weekly',
            'tag': 'weekly_task',
            'schedule_hour': 14,
            'schedule_minute': 30,
            'schedule_day_of_week': 1,
            'schedule_interval': None,
            'schedule_day_of_month': None,
        }

        self.assertEqual(result, expected)

    def test_scheduled_task_config_minutes_validation_success(self):
        mock_func = MagicMock()
        config = ScheduledTaskConfig(func=mock_func, schedule_type='minutes', schedule_interval=15)
        self.assertEqual(config.schedule_interval, 15)

    def test_scheduled_task_config_minutes_validation_missing_interval(self):
        mock_func = MagicMock()
        with self.assertRaises(ValueError) as context:
            ScheduledTaskConfig(func=mock_func, schedule_type='minutes')
        self.assertIn("minutes schedule requires positive schedule_interval", str(context.exception))

    def test_scheduled_task_config_minutes_validation_invalid_interval(self):
        mock_func = MagicMock()
        with self.assertRaises(ValueError) as context:
            ScheduledTaskConfig(func=mock_func, schedule_type='minutes', schedule_interval=0)
        self.assertIn("minutes schedule requires positive schedule_interval", str(context.exception))

    def test_scheduled_task_config_minutes_validation_invalid_hour_minute(self):
        mock_func = MagicMock()
        with self.assertRaises(ValueError) as context:
            ScheduledTaskConfig(func=mock_func, schedule_type='minutes', schedule_interval=15, schedule_hour=10)
        self.assertIn("minutes schedule should not specify hour or minute", str(context.exception))

    def test_scheduled_task_config_hourly_validation_success(self):
        mock_func = MagicMock()
        config = ScheduledTaskConfig(func=mock_func, schedule_type='hourly', schedule_interval=2)
        self.assertEqual(config.schedule_interval, 2)

    def test_scheduled_task_config_hourly_validation_missing_interval(self):
        mock_func = MagicMock()
        with self.assertRaises(ValueError) as context:
            ScheduledTaskConfig(func=mock_func, schedule_type='hourly')
        self.assertIn("hourly schedule requires positive schedule_interval", str(context.exception))

    def test_scheduled_task_config_hourly_validation_invalid_hour_minute(self):
        mock_func = MagicMock()
        with self.assertRaises(ValueError) as context:
            ScheduledTaskConfig(func=mock_func, schedule_type='hourly', schedule_interval=2, schedule_hour=10)
        self.assertIn("hourly schedule should not specify hour or minute", str(context.exception))

    def test_scheduled_task_config_daily_validation_success(self):
        mock_func = MagicMock()
        config = ScheduledTaskConfig(func=mock_func, schedule_type='daily', schedule_hour=10, schedule_minute=30)
        self.assertEqual(config.schedule_hour, 10)
        self.assertEqual(config.schedule_minute, 30)

    def test_scheduled_task_config_daily_validation_missing_hour(self):
        mock_func = MagicMock()
        with self.assertRaises(ValueError) as context:
            ScheduledTaskConfig(func=mock_func, schedule_type='daily', schedule_minute=30)
        self.assertIn("daily schedule requires schedule_hour and schedule_minute", str(context.exception))

    def test_scheduled_task_config_daily_validation_invalid_hour_range(self):
        mock_func = MagicMock()
        with self.assertRaises(ValueError) as context:
            ScheduledTaskConfig(func=mock_func, schedule_type='daily', schedule_hour=25, schedule_minute=30)
        self.assertIn("schedule_hour must be between 0 and 23", str(context.exception))

    def test_scheduled_task_config_daily_validation_invalid_minute_range(self):
        mock_func = MagicMock()
        with self.assertRaises(ValueError) as context:
            ScheduledTaskConfig(func=mock_func, schedule_type='daily', schedule_hour=10, schedule_minute=60)
        self.assertIn("schedule_minute must be between 0 and 59", str(context.exception))

    def test_scheduled_task_config_daily_validation_invalid_interval(self):
        mock_func = MagicMock()
        with self.assertRaises(ValueError) as context:
            ScheduledTaskConfig(
                func=mock_func, schedule_type='daily', schedule_hour=10, schedule_minute=30, schedule_interval=2
            )
        self.assertIn("daily schedule should not specify schedule_interval", str(context.exception))

    def test_scheduled_task_config_weekly_validation_success(self):
        mock_func = MagicMock()
        config = ScheduledTaskConfig(
            func=mock_func, schedule_type='weekly', schedule_day_of_week=1, schedule_hour=10, schedule_minute=30
        )
        self.assertEqual(config.schedule_day_of_week, 1)
        self.assertEqual(config.schedule_hour, 10)
        self.assertEqual(config.schedule_minute, 30)

    def test_scheduled_task_config_weekly_validation_missing_day(self):
        mock_func = MagicMock()
        with self.assertRaises(ValueError) as context:
            ScheduledTaskConfig(func=mock_func, schedule_type='weekly', schedule_hour=10, schedule_minute=30)
        self.assertIn("weekly schedule requires schedule_day_of_week", str(context.exception))

    def test_scheduled_task_config_weekly_validation_invalid_day_range(self):
        mock_func = MagicMock()
        with self.assertRaises(ValueError) as context:
            ScheduledTaskConfig(
                func=mock_func, schedule_type='weekly', schedule_day_of_week=7, schedule_hour=10, schedule_minute=30
            )
        self.assertIn("schedule_day_of_week must be between 0 (Monday) and 6 (Sunday)", str(context.exception))

    def test_scheduled_task_config_monthly_validation_success(self):
        mock_func = MagicMock()
        config = ScheduledTaskConfig(
            func=mock_func, schedule_type='monthly', schedule_day_of_month=15, schedule_hour=9, schedule_minute=0
        )
        self.assertEqual(config.schedule_day_of_month, 15)
        self.assertEqual(config.schedule_hour, 9)
        self.assertEqual(config.schedule_minute, 0)

    def test_scheduled_task_config_monthly_validation_missing_day(self):
        mock_func = MagicMock()
        with self.assertRaises(ValueError) as context:
            ScheduledTaskConfig(func=mock_func, schedule_type='monthly', schedule_hour=9, schedule_minute=0)
        self.assertIn("monthly schedule requires schedule_day_of_month", str(context.exception))

    def test_scheduled_task_config_monthly_validation_invalid_day_range(self):
        mock_func = MagicMock()
        with self.assertRaises(ValueError) as context:
            ScheduledTaskConfig(
                func=mock_func, schedule_type='monthly', schedule_day_of_month=32, schedule_hour=9, schedule_minute=0
            )
        self.assertIn("schedule_day_of_month must be between 1 and 31", str(context.exception))
