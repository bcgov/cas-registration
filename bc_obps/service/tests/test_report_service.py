from unittest import mock
from django.test import TestCase
from django.core.exceptions import ObjectDoesNotExist
from model_bakery import baker
from model_bakery.baker import make_recipe

from registration.models import RegulatedProduct, Activity, Operation
from registration.tests.utils.bakers import (
    bc_obps_regulated_operation_baker,
    operation_baker,
    operator_baker,
)
from reporting.models import ReportingYear, ReportVersion, ReportOperation, FacilityReport
from reporting.schema.report_operation import ReportOperationIn
from reporting.tests.utils.bakers import report_baker, reporting_year_baker
from service.report_service import ReportService


class TestReportService(TestCase):
    def test_throws_if_operation_doesnt_exist(self):
        baker.make(ReportingYear, reporting_year=2000)

        with self.assertRaises(ObjectDoesNotExist) as exception_context:
            ReportService.create_report(operation_id="00000000-00000000-00000000-00000000", reporting_year=2000)

        self.assertEqual(str(exception_context.exception), "Operation matching query does not exist.")

    def test_throws_if_year_doesnt_exist(self):
        operator = operator_baker({"trade_name": "test_trade_name"})
        operation = operation_baker(operator_id=operator.id, type=Operation.Types.SFO)

        with self.assertRaises(ObjectDoesNotExist) as exception_context:
            ReportService.create_report(operation.id, reporting_year=2000)

        self.assertEqual(
            str(exception_context.exception),
            "ReportingYear matching query does not exist.",
        )

    def test_throws_if_report_already_exists(self):
        operation = operation_baker(type=Operation.Types.LFO)
        reporting_year = reporting_year_baker(reporting_year=2002)
        _ = report_baker(operation=operation, reporting_year=reporting_year)

        with self.assertRaises(Exception) as exception_context:
            ReportService.create_report(operation.id, 2002)

        self.assertEqual(
            str(exception_context.exception),
            "A report already exists for this operation and year, unable to create a new one.",
        )

    def test_creates_report_with_right_data(self):
        with (
            mock.patch(
                "service.data_access_service.report_service.ReportDataAccessService.report_exists"
            ) as mock_report_data_access_service_report_exists,
            mock.patch(
                "service.data_access_service.facility_service.FacilityDataAccessService.get_current_facilities_by_operation"
            ) as mock_facility_data_access_service_get_current_facilities_by_operation,
        ):
            mock_facilities = baker.make_recipe('registration.tests.utils.facility', _quantity=3)

            mock_report_data_access_service_report_exists.return_value = False
            mock_facility_data_access_service_get_current_facilities_by_operation.return_value = mock_facilities

            operation = operation_baker(
                type=Operation.Types.LFO,
                bc_obps_regulated_operation=bc_obps_regulated_operation_baker(),
            )
            operation.activities.add(
                Activity.objects.get(name="Magnesium production"),
                Activity.objects.get(name="Hydrogen production"),
            )
            operation.regulated_products.add(
                RegulatedProduct.objects.get(name="Cement equivalent"),
                RegulatedProduct.objects.get(name="Mining: gold-equivalent"),
                RegulatedProduct.objects.get(name="Liquefied natural gas"),
            )
            reporting_year = reporting_year_baker(reporting_year=2101)
            # Calling the method under test
            report_version_id = ReportService.create_report(operation.id, reporting_year=2101)
            report = ReportVersion.objects.get(pk=report_version_id).report

            # Testing the report data
            self.assertEqual(report.operation.id, operation.id)
            self.assertEqual(report.operator.id, operation.operator.id)
            self.assertEqual(report.reporting_year, reporting_year)

            self.assertEqual(report.report_versions.count(), 1)
            # Testing the report version
            report_version = report.report_versions.first()
            self.assertEqual(report_version.report, report)
            self.assertFalse(report_version.is_latest_submitted)
            self.assertEqual(report_version.status, 'Draft')

            # Testing the report_operation data
            self.assertSequenceEqual(
                (
                    report_version.report_operation.operator_legal_name,
                    report_version.report_operation.operator_trade_name,
                    report_version.report_operation.operation_name,
                    report_version.report_operation.operation_type,
                    report_version.report_operation.operation_bcghgid,
                    report_version.report_operation.bc_obps_regulated_operation_id,
                    report_version.report_operation.activities.count(),
                ),
                (
                    operation.operator.legal_name,
                    operation.operator.trade_name,
                    operation.name,
                    operation.type,
                    operation.bcghg_id,
                    operation.bc_obps_regulated_operation.id,
                    2,
                ),
            )

            # Testing the facilityreport data
            facility_reports = report_version.facility_reports.order_by("facility__id")
            self.assertEqual(facility_reports.count(), 3)

            mock_facilities.sort(key=lambda f: f.id)

            for index, facility in enumerate(mock_facilities):
                facility_report = facility_reports.all()[index]
                self.assertSequenceEqual(
                    (
                        facility_report.facility,
                        facility_report.facility_name,
                        facility_report.facility_type,
                        facility_report.facility_bcghgid,
                        facility_report.activities.count(),
                    ),
                    (
                        facility,
                        facility.name,
                        facility.type,
                        facility.bcghg_id,
                        2,
                    ),
                )

    def test_save_report_operation_updates_fields_and_relationships(self):
        operation = operation_baker(type=Operation.Types.LFO)
        reporting_year = reporting_year_baker(reporting_year=2101)
        report_version = report_baker(operation=operation, reporting_year=reporting_year)

        # Create input data for the ReportOperationIn object
        data = ReportOperationIn(
            operator_legal_name="Updated Legal Name",
            operator_trade_name="Updated Trade Name",
            operation_name="Updated Operation Name",
            operation_type="Updated Operation Type",
            operation_bcghgid="Updated BC GHID",
            bc_obps_regulated_operation_id="Updated Regulated Operation ID",
            activities=[18, 14],
            regulated_products=[2, 13],
            operation_representative_name=[1, 2],
            operation_report_type="New Report Type",
            registration_purpose="OBPS Regulated Operation",
        )

        with (
            mock.patch('service.report_service.ReportOperation.objects.get') as mock_get,
            mock.patch('service.report_service.ReportOperationRepresentative.objects.filter') as mock_filter,
            mock.patch('service.report_service.FacilityReport.objects.filter') as mock_facility_filter,
            mock.patch('service.report_service.Activity.objects.filter') as mock_activity_filter,
            mock.patch('service.report_service.RegulatedProduct.objects.filter') as mock_regulated_product_filter,
        ):
            mock_report_operation = mock.MagicMock(spec=ReportOperation)
            mock_get.return_value = mock_report_operation

            mock_filter.return_value.update.return_value = None

            # Mock FacilityReport behavior
            mock_facility_reports = [mock.MagicMock(spec=FacilityReport) for _ in range(3)]
            mock_facility_filter.return_value = mock_facility_reports

            # Mock Activity filtering
            mock_activity_1 = mock.MagicMock(spec=Activity, name="Hydrogen production")
            mock_activity_2 = mock.MagicMock(spec=Activity, name="Magnesium production")
            mock_activity_filter.return_value = [mock_activity_1, mock_activity_2]

            # Mock RegulatedProduct filtering
            mock_regulated_product_1 = mock.MagicMock(spec=RegulatedProduct, name="Cement equivalent")
            mock_regulated_product_2 = mock.MagicMock(spec=RegulatedProduct, name="Mining: gold-equivalent")
            mock_regulated_product_filter.return_value = [mock_regulated_product_1, mock_regulated_product_2]

            ReportService.save_report_operation(report_version.id, data)

            mock_report_operation.activities.set.assert_called_once_with([mock_activity_1, mock_activity_2])

            mock_report_operation.regulated_products.set.assert_called_once_with(
                [mock_regulated_product_1, mock_regulated_product_2]
            )

            # Verify that other fields were updated correctly
            mock_report_operation.operator_legal_name = data.operator_legal_name
            mock_report_operation.operator_trade_name = data.operator_trade_name
            mock_report_operation.operation_name = data.operation_name
            mock_report_operation.operation_type = data.operation_type
            mock_report_operation.operation_bcghgid = data.operation_bcghgid
            mock_report_operation.bc_obps_regulated_operation_id = data.bc_obps_regulated_operation_id
            mock_report_operation.operation_report_type = data.operation_report_type

    def test_get_registration_purpose_by_version_id_returns_correct_data(self):
        """
        Test that the service retrieves the correct registration purpose
        for a given report version ID.
        """
        self.report_version = baker.make_recipe("reporting.tests.utils.report_version")
        self.report_operation = make_recipe(
            'reporting.tests.utils.report_operation', report_version=self.report_version
        )
        retrieved_data = ReportService.get_registration_purpose_by_version_id(version_id=self.report_version.id)
        self.assertIsNotNone(retrieved_data)
        self.assertEqual(retrieved_data["registration_purpose"], self.report_operation.registration_purpose)
