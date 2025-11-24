from common.tests.utils.helpers import BaseTestCase
from reporting.tests.utils.bakers import reporting_year_baker
from reporting.models import ReportingYear
from django.test import TestCase


class TestInitialData(TestCase):
    def test_reporting_year_initial_data(self):
        expected_reporting_years = sorted([2023, 2024, 2025, 2026])
        existing_reporting_years = sorted(list(ReportingYear.objects.values_list('reporting_year', flat=True)))

        self.assertEqual(len(existing_reporting_years), len(expected_reporting_years))
        self.assertEqual(existing_reporting_years, expected_reporting_years)


class ReportingYearModelTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        cls.test_object = reporting_year_baker()
        cls.field_data = [
            ("report", "report", None, None),
            ("compliance_charge_rate", "compliance charge rate", None, None),
            ("compliance_period", "compliance period", None, 0),
            ("reporting_year", "reporting year", None, None),
            ("reporting_window_start", "reporting window start", None, None),
            ("reporting_window_end", "reporting window end", None, None),
            ("report_due_date", "report due date", None, None),
            ("report_open_date", "report open date", None, None),
            ("description", "description", 10000, None),
        ]
