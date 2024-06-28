from unittest import mock
from django.test import TestCase
from django.core.exceptions import ObjectDoesNotExist
from model_bakery import baker
from registration.models.regulated_product import RegulatedProduct
from registration.models.reporting_activity import ReportingActivity
from registration.tests.utils.bakers import (
    bc_obps_regulated_operation_baker,
    operation_baker,
    operator_baker,
    facility_baker,
)
from reporting.models.reporting_year import ReportingYear
from reporting.tests.utils.bakers import report_baker, reporting_year_baker
from service.report_service import ReportService


class TestReportService(TestCase):
    from service.report_service import ReportService

    def test_throws_if_operation_doesnt_exist(self):
        baker.make(ReportingYear, reporting_year=2000)

        with self.assertRaises(ObjectDoesNotExist) as exceptionContext:
            ReportService.create_report(operation_id="00000000-00000000-00000000-00000000", reporting_year=2000)

        self.assertEqual(str(exceptionContext.exception), "Operation matching query does not exist.")

    def test_throws_if_year_doesnt_exist(self):
        operator = operator_baker({"trade_name": "test_trade_name"})
        operation = operation_baker(operator_id=operator.id, type="sfo")

        with self.assertRaises(ObjectDoesNotExist) as exceptionContext:
            ReportService.create_report(operation.id, reporting_year=2000)

        self.assertEqual(str(exceptionContext.exception), "ReportingYear matching query does not exist.")

    def test_throws_if_report_already_exists(self):

        operation = operation_baker(type="lfo")
        reporting_year = reporting_year_baker(reporting_year=2002)
        _ = report_baker(operation=operation, reporting_year=reporting_year)

        with self.assertRaises(Exception) as exceptionContext:
            ReportService.create_report(operation.id, 2002)

        self.assertEqual(
            str(exceptionContext.exception),
            "A report already exists for this operation and year, unable to create a new one.",
        )

    def test_creates_report_with_right_data(self):

        with (
            mock.patch(
                "service.data_access_service.report_service.ReportDataAccessService.report_exists"
            ) as mock_report_data_access_service_report_exists,
            mock.patch(
                "service.data_access_service.facility_service.FacilityDataAccessService.get_currently_owned"
            ) as mock_facility_data_access_service_get_currently_owned,
        ):
            mock_facilities = [
                facility_baker(),
                facility_baker(),
                facility_baker(),
            ]

            mock_report_data_access_service_report_exists.return_value = False
            mock_facility_data_access_service_get_currently_owned.return_value = mock_facilities

            operation = operation_baker(type="lfo", bc_obps_regulated_operation=bc_obps_regulated_operation_baker())
            operation.reporting_activities.add(
                ReportingActivity.objects.get(name='Magnesium production'),
                ReportingActivity.objects.get(name='Hydrogen production'),
            )
            operation.regulated_products.add(
                RegulatedProduct.objects.get(name='Cement equivalent'),
                RegulatedProduct.objects.get(name='Mining: gold-equivalent'),
                RegulatedProduct.objects.get(name='Liquefied natural gas'),
            )
            reporting_year = reporting_year_baker(reporting_year=2101)

            report = ReportService.create_report(operation.id, reporting_year=2101)

            # Testing the report data
            self.assertEqual(report.operation.id, operation.id)
            self.assertEqual(report.reporting_year, reporting_year)

            # Testing the report_operation data
            self.assertSequenceEqual(
                (
                    report.report_operation.operator_legal_name,
                    report.report_operation.operator_trade_name,
                    report.report_operation.operation_name,
                    report.report_operation.operation_type,
                    report.report_operation.operation_bcghgid,
                    report.report_operation.bc_obps_regulated_operation_id,
                    report.report_operation.operation_representative_name,
                    report.report_operation.activities.count(),
                ),
                (
                    operation.operator.legal_name,
                    operation.operator.trade_name,
                    operation.name,
                    operation.type,
                    operation.bcghg_id,
                    operation.bc_obps_regulated_operation.id,
                    operation.point_of_contact.get_full_name(),
                    2,
                ),
            )

            # Testing the report_facility data
            self.assertEqual(report.report_facilities.count(), 3)
            for index, facility in enumerate(mock_facilities):
                report_facility = report.report_facilities.all()[index]
                self.assertSequenceEqual(
                    (
                        report_facility.facility_name,
                        report_facility.facility_type,
                        report_facility.facility_bcghgid,
                        report_facility.activities.count(),
                        report_facility.products.count(),
                    ),
                    (
                        facility.name,
                        facility.type,
                        facility.bcghg_id,
                        2,
                        3,
                    ),
                )
