import pytest
from compliance.tests.utils.compliance_test_helper import ComplianceTestHelper
from compliance.models import ComplianceReportVersion

pytestmark = pytest.mark.django_db


class TestDylan:

    def test_dylan(self):

        # NO ARGS
        no_args = ComplianceTestHelper.build_test_data()
        print("\n\nno args PASSED TO BUILDER: ")
        print(f'REPORTING YEAR = {no_args.reporting_year.reporting_year}')
        print(f'COMPLIANCE STATUS = {no_args.compliance_report_version.status}')

        # OBLIGATION NOT MET
        onm = ComplianceTestHelper.build_test_data(
            crv_status=ComplianceReportVersion.ComplianceStatus.OBLIGATION_NOT_MET
        )
        print("\ncrv_status ARG PASSED TO BUILDER: ")
        print(f'REPORTING YEAR = {onm.reporting_year.reporting_year}')
        print(f'COMPLIANCE STATUS = {onm.compliance_report_version.status}')

        # OBLIGATION FULLY MET WITH INVOICE
        onm = ComplianceTestHelper.build_test_data(
            crv_status=ComplianceReportVersion.ComplianceStatus.OBLIGATION_FULLY_MET, create_invoice_data=True
        )
        print("\ncrv_status & create_invoice TRUE ARG PASSED TO BUILDER: ")
        print(f'REPORTING YEAR = {onm.reporting_year.reporting_year}')
        print(f'COMPLIANCE STATUS = {onm.compliance_report_version.status}')
        print(f'INVOICE AMOUNT = {onm.invoice.outstanding_balance}')

        # WITH REPORTING_YEAR ARG
        ry = ComplianceTestHelper.build_test_data(reporting_year=2666)
        print("\nreporting_year ARG PASSED TO BUILDER: ")
        print(f'REPORTING YEAR = {ry.reporting_year.reporting_year}')
        print(f'COMPLIANCE DEADLINE = {ry.compliance_period.compliance_deadline}')
        print(f'COMPLIANCE STATUS = {ry.compliance_report_version.status}')

        # SUPPLEMENTARY
        su = ComplianceTestHelper.build_test_data(
            previous_data=ry, crv_status=ComplianceReportVersion.ComplianceStatus.OBLIGATION_NOT_MET
        )
        print("\nprevious_data ARG PASSED TO BUILDER: ")
        print("SUPPLEMENTARY ID: ", su.compliance_report_version.id)
        print(f'COMPLIANCE STATUS = {su.compliance_report_version.status}')
        print("PREVIOUS ID: ", su.compliance_report_version.previous_version.id)
        print("RY COMPLIANCE REPORT ID: ", ry.compliance_report.id)
        print("SU COMPLIANCE REPORT ID: ", su.compliance_report_version.compliance_report.id)

        # SUPPLEMENTARY WITH INVOICE DATA
        sui = ComplianceTestHelper.build_test_data(
            previous_data=onm,
            crv_status=ComplianceReportVersion.ComplianceStatus.OBLIGATION_NOT_MET,
            create_invoice_data=True,
        )
        print("\nprevious_data & create_invoice TRUE ARG PASSED TO BUILDER: ")
        print("\nSUPPLEMENTARY ID: ", sui.compliance_report_version.id)
        print(f'COMPLIANCE STATUS = {sui.compliance_report_version.status}')
        print("PREVIOUS ID: ", sui.compliance_report_version.previous_version.id)
        print("ONM COMPLIANCE REPORT ID: ", onm.compliance_report.id)
        print("SU COMPLIANCE REPORT ID: ", sui.compliance_report_version.compliance_report.id)
        print(f'INVOICE AMOUNT = {sui.invoice.outstanding_balance}')

        assert 1 == 1
