from unittest import mock
from django.test import TestCase, override_settings
from django.core.exceptions import ObjectDoesNotExist
from model_bakery import baker
from model_bakery.baker import make_recipe

from registration.models import RegulatedProduct, Activity, Operation, NaicsCode
from common.exceptions import UserError
from registration.tests.utils.bakers import (
    bc_obps_regulated_operation_baker,
    operation_baker,
    operator_baker,
)
from reporting.models import ReportingYear, ReportVersion, ReportOperation, FacilityReport, ReportProduct
from reporting.schema.report_operation import ReportOperationIn
from reporting.tests.utils.bakers import report_baker, reporting_year_baker
from service.report_service import ReportService


class TestReportService(TestCase):
    def test_throws_if_operation_doesnt_exist(self):
        baker.make(ReportingYear, reporting_year=2000)

        with self.assertRaises(ObjectDoesNotExist) as exception_context:
            ReportService.create_report(operation_id="00000000-00000000-00000000-00000000", reporting_year=2000)

        self.assertEqual(
            str(exception_context.exception),
            "Designated operator for reporting year 2000 not found for operation 00000000-00000000-00000000-00000000.",
        )

    def test_throws_if_year_doesnt_exist(self):
        operator = operator_baker({"trade_name": "test_trade_name"})
        operation = operation_baker(operator_id=operator.id, type=Operation.Types.SFO)
        make_recipe(
            'registration.tests.utils.operation_designated_operator_timeline',
            operator=operator,
            operation=operation,
            start_date="2023-01-01",
            end_date=None,
        )

        with self.assertRaises(ObjectDoesNotExist) as exception_context:
            ReportService.create_report(operation.id, reporting_year=2000)

        self.assertEqual(
            str(exception_context.exception),
            f"Designated operator for reporting year 2000 not found for operation {operation.id}.",
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

    @override_settings(RESTRICTED_NAICS_CODES_FOR_REPORTING="111110,211110,312120")
    def test_throws_if_operation_has_restricted_naics_code(self):
        # Create a restricted NAICS code
        restricted_naics = baker.make(
            NaicsCode, naics_code="211110", naics_description="Oil and gas extraction", is_regulated=True
        )

        # Create operator and operation with restricted NAICS code
        operator = operator_baker({"trade_name": "test_trade_name"})
        operation = operation_baker(
            operator_id=operator.id,
            type=Operation.Types.SFO,
            status=Operation.Statuses.REGISTERED,
        )
        # Assign restricted NAICS code after creation
        operation.naics_code = restricted_naics
        operation.save()

        # Create reporting year and timeline
        reporting_year_baker(reporting_year=2030)
        make_recipe(
            'registration.tests.utils.operation_designated_operator_timeline',
            operator=operator,
            operation=operation,
            start_date="2029-01-01",
            end_date=None,
        )

        # Test that creating a report raises UserError for restricted NAICS code
        with self.assertRaises(UserError) as exception_context:
            ReportService.create_report(operation.id, reporting_year=2030)

        self.assertEqual(
            str(exception_context.exception),
            "Reporting window is not open for your industry yet. Please check back later.",
        )

    @override_settings(RESTRICTED_NAICS_CODES_FOR_REPORTING="111110,312120")
    def test_creates_report_with_non_restricted_naics_code(self):
        # Create a non-restricted NAICS code
        non_restricted_naics = baker.make(
            NaicsCode,
            naics_code="211110",  # Not in the restricted list
            naics_description="Oil and gas extraction",
            is_regulated=True,
        )

        with (
            mock.patch(
                "service.data_access_service.report_service.ReportDataAccessService.report_exists"
            ) as mock_report_data_access_service_report_exists,
            mock.patch(
                "service.data_access_service.facility_service.FacilityDataAccessService.get_current_facilities_by_operation"
            ) as mock_facility_data_access_service_get_current_facilities_by_operation,
        ):
            mock_facilities = baker.make_recipe('registration.tests.utils.facility', _quantity=1)
            mock_report_data_access_service_report_exists.return_value = False
            mock_facility_data_access_service_get_current_facilities_by_operation.return_value = mock_facilities

            # Create operator and operation with non-restricted NAICS code
            operator = operator_baker({"trade_name": "test_trade_name"})
            operation = operation_baker(
                operator_id=operator.id,
                type=Operation.Types.SFO,
                status=Operation.Statuses.REGISTERED,
                bc_obps_regulated_operation=bc_obps_regulated_operation_baker(),
            )
            # Assign non-restricted NAICS code after creation
            operation.naics_code = non_restricted_naics
            operation.save()

            # Create reporting year and timeline
            reporting_year_baker(reporting_year=2031)
            make_recipe(
                'registration.tests.utils.operation_designated_operator_timeline',
                operator=operator,
                operation=operation,
                start_date="2030-01-01",
                end_date=None,
            )

            # Test that creating a report succeeds for non-restricted NAICS code
            report_version_id = ReportService.create_report(operation.id, reporting_year=2031)

            # Verify the report was created successfully
            self.assertIsNotNone(report_version_id)
            report = ReportVersion.objects.get(pk=report_version_id).report
            self.assertEqual(report.operation.id, operation.id)

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
                status=Operation.Statuses.REGISTERED,
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
            make_recipe(
                'registration.tests.utils.operation_designated_operator_timeline',
                operator=operation.operator,
                operation=operation,
                start_date="2023-01-01",
                end_date=None,
            )

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

    def test_creates_report_with_right_data_with_transferred_operation(self):
        with (
            mock.patch(
                "service.data_access_service.report_service.ReportDataAccessService.report_exists"
            ) as mock_report_data_access_service_report_exists,
            mock.patch(
                "service.data_access_service.facility_service.FacilityDataAccessService.get_current_facilities_by_operation"
            ) as mock_facility_data_access_service_get_current_facilities_by_operation,
        ):
            mock_facilities = baker.make_recipe('registration.tests.utils.facility', _quantity=2)

            mock_report_data_access_service_report_exists.return_value = False
            mock_facility_data_access_service_get_current_facilities_by_operation.return_value = mock_facilities

            # Create two operators to simulate a transfer
            operator_old = operator_baker()
            operator_new = operator_baker()
            # Create Operation associated with the new operator
            operation = operation_baker(
                type=Operation.Types.SFO,
                bc_obps_regulated_operation=bc_obps_regulated_operation_baker(),
                status=Operation.Statuses.REGISTERED,
                operator_id=operator_new.id,
                name="Gimli's Mines of Moria",
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

            # Create timeline entries to simulate a transfer happened from operator_old to operator_new after the end of the reporting year
            make_recipe(
                'registration.tests.utils.operation_designated_operator_timeline',
                operator=operator_old,
                operation=operation,
                start_date="2020-01-01",
                end_date="2025-03-01",
            )
            make_recipe(
                'registration.tests.utils.operation_designated_operator_timeline',
                operator=operator_new,
                operation=operation,
                start_date="2025-03-02",
                end_date=None,
            )
            # Create contacts for the old operator because they will be used as operation representatives instead of the operation contacts
            contacts = baker.make_recipe(
                'registration.tests.utils.contact',
                operator=operator_old,
                business_role_id="Operation Representative",
                _quantity=3,
            )

            # Calling the method under test
            report_version_id = ReportService.create_report(operation.id, reporting_year=2024)
            report = ReportVersion.objects.get(pk=report_version_id).report

            # Testing the report data
            self.assertEqual(report.operation.id, operation.id)
            self.assertEqual(report.operator.id, operator_old.id)
            self.assertEqual(report.reporting_year.reporting_year, 2024)
            self.assertEqual(report.report_versions.count(), 1)
            # Testing the report version
            report_version = report.report_versions.first()
            self.assertEqual(report_version.report, report)
            self.assertFalse(report_version.is_latest_submitted)
            self.assertEqual(report_version.status, 'Draft')

            # Testing the report_operation data
            # NOTE: This test will need to be updated when we improve our handling for transferred operations
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
                    operator_old.legal_name,
                    operator_old.trade_name,
                    operation.name,
                    operation.type,
                    operation.bcghg_id,
                    operation.bc_obps_regulated_operation.id,
                    2,
                ),
            )
            # Testing the operation representatives come from the contacts of the original operator
            operation_representatives = report_version.report_operation_representatives.all().order_by(
                "representative_name"
            )

            self.assertEqual(operation_representatives.count(), 3)
            for index, contact in enumerate(contacts):
                self.assertEqual(operation_representatives.all()[index].representative_name, contact.get_full_name())

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
            mock.patch('service.report_service.FacilityReport.objects.get') as mock_facility_get,
            mock.patch('service.report_service.Activity.objects.filter') as mock_activity_filter,
            mock.patch('service.report_service.RegulatedProduct.objects.filter') as mock_regulated_product_filter,
        ):
            mock_report_operation = mock.MagicMock(spec=ReportOperation)
            mock_get.return_value = mock_report_operation

            mock_filter.return_value.update.return_value = None

            # Mock FacilityReport behavior
            mock_facility_report = mock.MagicMock(spec=FacilityReport, report_version_id=report_version.id, id=999)
            mock_facility_reports = [
                mock.MagicMock(spec=FacilityReport, report_version_id=report_version.id) for _ in range(3)
            ]
            mock_facility_get.return_value = mock_facility_report
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

    def test_deletes_child_report_product_records_on_product_set_change_for_lfo(self):
        """
        Test that for Linear Facilities Operation, updating regulated products
        prunes report product data for each facility report.
        """
        operator = baker.make_recipe('registration.tests.utils.operator')
        operation = operation_baker(type=Operation.Types.LFO, operator_id=operator.id)
        report = baker.make_recipe('reporting.tests.utils.report', operation=operation)
        report_version = baker.make_recipe('reporting.tests.utils.report_version', report=report)
        report_operation = baker.make_recipe(
            'reporting.tests.utils.report_operation',
            report_version=report_version,
            operation_type='Linear Facilities Operation',
        )
        report_operation.regulated_products.set([1, 2, 3])
        facility_report = baker.make_recipe('reporting.tests.utils.facility_report', report_version=report_version)
        report_product_1 = baker.make_recipe(
            'reporting.tests.utils.report_product',
            report_version=report_version,
            facility_report=facility_report,
            product_id=1,
        )
        report_product_2 = baker.make_recipe(
            'reporting.tests.utils.report_product',
            report_version=report_version,
            facility_report=facility_report,
            product_id=2,
        )
        report_product_3 = baker.make_recipe(
            'reporting.tests.utils.report_product',
            report_version=report_version,
            facility_report=facility_report,
            product_id=3,
        )

        data = ReportOperationIn(
            operator_legal_name="Updated Legal Name",
            operator_trade_name="Updated Trade Name",
            operation_name="Updated Operation Name",
            operation_type="Linear Facilities Operation",
            operation_bcghgid="Updated BC GHID",
            bc_obps_regulated_operation_id="Updated Regulated Operation ID",
            activities=[18, 14],
            regulated_products=[1],
            operation_representative_name=[1, 2],
            operation_report_type="New Report Type",
            registration_purpose="OBPS Regulated Operation",
        )

        ReportService.save_report_operation(report_version.id, data)

        report_operation.refresh_from_db()

        assert ReportProduct.objects.filter(id=report_product_1.id).exists()
        assert not ReportProduct.objects.filter(id=report_product_2.id).exists()
        assert not ReportProduct.objects.filter(id=report_product_3.id).exists()

    def test_save_report_operation_updates_facility_report_for_all_operation_types(self):
        """
        Test that updating operation-level data also updates the facility report
        for all operation types (both LFO and SFO).
        """
        operator = baker.make_recipe('registration.tests.utils.operator')
        operation = operation_baker(type=Operation.Types.SFO, operator_id=operator.id)
        report = baker.make_recipe('reporting.tests.utils.report', operation=operation)
        report_version = baker.make_recipe('reporting.tests.utils.report_version', report=report)
        report_operation = baker.make_recipe('reporting.tests.utils.report_operation', report_version=report_version)
        report_operation.activities.set([1, 2, 3])
        facility_report = baker.make_recipe('reporting.tests.utils.facility_report', report_version=report_version)
        facility_report.activities.set([1, 2, 3])

        data = ReportOperationIn(
            operator_legal_name="Updated Legal Name",
            operator_trade_name="Updated Trade Name",
            operation_name="Updated Operation Name",
            operation_type="Single Facility Operation",
            operation_bcghgid="Updated BC GHID",
            bc_obps_regulated_operation_id="Updated Regulated Operation ID",
            activities=[18, 14],
            regulated_products=[1],
            operation_representative_name=[1, 2],
            operation_report_type="New Report Type",
            registration_purpose="OBPS Regulated Operation",
        )

        ReportService.save_report_operation(report_version.id, data)

        facility_report.refresh_from_db()
        report_operation.refresh_from_db()

        # Verify facility report is updated with operation-level activities
        assert facility_report.activities.count() == 2
        self.assertQuerySetEqual(
            facility_report.activities.all(),
            Activity.objects.filter(id__in=[18, 14]),
            ordered=False,
        )
        # Verify facility name is updated from operation name
        assert facility_report.facility_name == "Updated Operation Name"

    def test_save_report_operation_updates_all_facility_reports_for_lfo(self):
        """
        Test that updating operation-level data for Linear Facilities Operation
        sets activities and prunes regulated products for all facility reports.
        """
        operator = baker.make_recipe('registration.tests.utils.operator')
        operation = operation_baker(type=Operation.Types.LFO, operator_id=operator.id)
        report = baker.make_recipe('reporting.tests.utils.report', operation=operation)
        report_version = baker.make_recipe('reporting.tests.utils.report_version', report=report)
        report_operation = baker.make_recipe(
            'reporting.tests.utils.report_operation',
            report_version=report_version,
            operation_type='Linear Facilities Operation',
        )
        report_operation.activities.set([1, 2, 3])
        report_operation.regulated_products.set([1, 2, 3])

        # Create multiple facility reports for LFO
        facility_report_1 = baker.make_recipe('reporting.tests.utils.facility_report', report_version=report_version)
        facility_report_1.activities.set([1, 2, 3])
        facility_report_2 = baker.make_recipe('reporting.tests.utils.facility_report', report_version=report_version)
        facility_report_2.activities.set([1, 2, 3])
        facility_report_3 = baker.make_recipe('reporting.tests.utils.facility_report', report_version=report_version)
        facility_report_3.activities.set([1, 2, 3])

        # Create report products for each facility
        for facility in [facility_report_1, facility_report_2, facility_report_3]:
            baker.make_recipe(
                'reporting.tests.utils.report_product',
                report_version=report_version,
                facility_report=facility,
                product_id=1,
            )
            baker.make_recipe(
                'reporting.tests.utils.report_product',
                report_version=report_version,
                facility_report=facility,
                product_id=2,
            )
            baker.make_recipe(
                'reporting.tests.utils.report_product',
                report_version=report_version,
                facility_report=facility,
                product_id=3,
            )

        data = ReportOperationIn(
            operator_legal_name="Updated Legal Name",
            operator_trade_name="Updated Trade Name",
            operation_name="Updated Operation Name",
            operation_type="Linear Facilities Operation",
            operation_bcghgid="Updated BC GHID",
            bc_obps_regulated_operation_id="Updated Regulated Operation ID",
            activities=[18, 14],
            regulated_products=[1],
            operation_representative_name=[1, 2],
            operation_report_type="New Report Type",
            registration_purpose="OBPS Regulated Operation",
        )

        ReportService.save_report_operation(report_version.id, data)

        facility_report_1.refresh_from_db()
        facility_report_2.refresh_from_db()
        facility_report_3.refresh_from_db()
        report_operation.refresh_from_db()

        # Verify all facility reports have activities replaced (old [1,2,3] removed, new [18,14] set)
        for facility in [facility_report_1, facility_report_2, facility_report_3]:
            assert facility.activities.count() == 2
            self.assertQuerySetEqual(
                facility.activities.all(),
                Activity.objects.filter(id__in=[18, 14]),
                ordered=False,
            )
            # Verify only products in the updated list remain
            assert ReportProduct.objects.filter(facility_report=facility, product_id=1).exists()
            assert not ReportProduct.objects.filter(facility_report=facility, product_id=2).exists()
            assert not ReportProduct.objects.filter(facility_report=facility, product_id=3).exists()
