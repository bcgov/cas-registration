from unittest import skip
from django.test import TestCase
from django.core.exceptions import ObjectDoesNotExist
from model_bakery import baker
from registration.models.operation import Operation
from registration.tests.utils.bakers import operation_baker, operator_baker
from reporting.models.reporting_year import ReportingYear
from service.report_service import ReportService


class TestReportService(TestCase):
    from service.report_service import ReportService

    def test_throws_if_operation_doesnt_exist(self):
        baker.make(ReportingYear, reporting_year=2000)

        self.assertEqual(ReportingYear.objects.count(), 1)

        with self.assertRaises(ObjectDoesNotExist) as exceptionContext:
            ReportService.create_report(operation_id="00000000-00000000-00000000-00000000", reporting_year=2000)

        self.assertEqual(str(exceptionContext.exception), "Operation matching query does not exist.")

    def test_throws_if_year_doesnt_exist(self):
        operator = operator_baker({"trade_name": "test_trade_name"})
        operation = operation_baker(operator_id=operator.id, custom_properties={"type": "sfo"})

        print("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
        print([op.id for op in Operation.objects.all()])

        with self.assertRaises(ObjectDoesNotExist) as exceptionContext:
            ReportService.create_report(operation.id, reporting_year=2000)

        self.assertEqual(str(exceptionContext.exception), "test!")

    @skip
    def test_creates_report_with_right_data(self):
        pass

    @skip
    def test_create_report_returns_existing_report_if_exists(self):

        pass
