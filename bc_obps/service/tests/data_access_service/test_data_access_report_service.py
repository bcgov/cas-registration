from django.test import TestCase
from model_bakery import baker
from registration.tests.utils.bakers import operation_baker
from reporting.models.report import Report
from reporting.models.reporting_year import ReportingYear


class TestDataAccessReportService(TestCase):
    def test_report_exists(self):
        from service.data_access_service.report_service import ReportDataAccessService

        operation = operation_baker()
        reporting_year = baker.make(ReportingYear, reporting_year=1998)

        self.assertIsNone(
            ReportDataAccessService.report_exists(operation_id=operation.id, reporting_year=1998),
            "Returns None if there is no report for that operation and year",
        )

        report = baker.make(Report, operation=operation, reporting_year=reporting_year)

        self.assertIsNone(
            ReportDataAccessService.report_exists(
                operation_id="00000000-00000000-00000000-00000000", reporting_year=1998
            ),
            "Returns None if the uuid doesn't point to the existing report",
        )
        self.assertIsNone(
            ReportDataAccessService.report_exists(operation_id=operation.id, reporting_year=1999),
            "Returns None if there is no report for the year that was passed in",
        )
        self.assertTrue(
            ReportDataAccessService.report_exists(operation_id=operation.id, reporting_year=1998),
            "Returns a truthy value if the report exists",
        )
        self.assertEqual(
            ReportDataAccessService.report_exists(operation_id=operation.id, reporting_year=1998),
            report,
            "Returns the existing report that was found for that operation and year",
        )
