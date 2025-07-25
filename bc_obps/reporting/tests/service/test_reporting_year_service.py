import pytest
from datetime import datetime, timezone
from unittest.mock import patch
from service.reporting_year_service import ReportingYearService
from reporting.models import ReportingYear

pytestmark = pytest.mark.django_db


@patch('service.reporting_year_service.timezone')
class TestReportingYearService:
    def setup_method(self):
        self.reporting_year = ReportingYear.objects.create(
            reporting_year=2000,
            reporting_window_start='2001-01-01T00:00:00.000Z',
            reporting_window_end='2001-12-31T23:59:59.999Z',
            report_due_date='2001-05-31T23:59:59.999Z',
            description='Test reporting year',
        )

    def test_get_current_reporting_year(self, mock_timezone):
        expected_reporting_year = 2000
        fake_now = datetime(2001, 1, 1, tzinfo=timezone.utc)

        mock_timezone.now.return_value = fake_now
        current_reporting_year = ReportingYearService.get_current_reporting_year()

        assert current_reporting_year.reporting_year == expected_reporting_year
