import datetime
from django.test import TestCase
from reporting.tests.utils.bakers import baker
from service.utils.get_report_valid_date_from_version_id import get_report_valid_date_from_version_id


class TestServiceUtils(TestCase):
    def test_get_report_valid_date_from_version_id(self):
        TEST_YEAR = 2024
        DEFAULT_MONTH = 5
        DEFAULT_DAY = 31
        TEST_DATE = datetime.date(TEST_YEAR, DEFAULT_MONTH, DEFAULT_DAY)
        report_version = baker.make_recipe("reporting.tests.utils.report_version", report__reporting_year_id=TEST_YEAR)
        assert get_report_valid_date_from_version_id(report_version.id) == TEST_DATE
