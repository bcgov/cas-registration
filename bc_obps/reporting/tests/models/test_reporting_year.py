from common.tests.utils.helpers import BaseTestCase
from reporting.models.reporting_year import ReportingYear


class ReportingYearTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        cls.test_object = ReportingYear.objects.create(
            reporting_year=1234,
            reporting_window_start="2025-01-01T00:00:00.000Z",
            reporting_window_end="2025-01-01T01:00:00.000Z",
            report_due_date="2025-05-31T23:59:59.999Z",
            description="test description",
        )
        cls.field_data = [
            ("reporting_year", "reporting year", None, None),
            ("reporting_window_start", "reporting window start", None, None),
            ("reporting_window_end", "reporting window end", None, None),
            ("report_due_date", "report due date", None, None),
            ("description", "description", None, None),
            ("report", "report", None, None),
            ("compliance_period", "compliance period", None, None),
        ]
