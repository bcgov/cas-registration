import pytest
from compliance.tests.utils.compliance_test_helper import ComplianceTestHelper
from compliance.models import ComplianceReportVersion

pytestmark = pytest.mark.django_db


class TestDylan:

    def test_dylan(self):

        # NO ARGS
        no_args = ComplianceTestHelper.build_initial_compliance_report()
        print("\n\nno args PASSED TO BUILDER: ")
        print(f'REPORTING YEAR = {no_args.reporting_year.reporting_year}')
        print(f'COMPLIANCE STATUS = {no_args.initial_compliance_report_version.status}')

        # OBLIGATION NOT MET
        onm = ComplianceTestHelper.build_initial_compliance_report(
            crv_status=ComplianceReportVersion.ComplianceStatus.OBLIGATION_NOT_MET
        )
        print("\ncrv_status ARG PASSED TO BUILDER: ")
        print(f'REPORTING YEAR = {onm.reporting_year.reporting_year}')
        print(f'COMPLIANCE STATUS = {onm.initial_compliance_report_version.status}')

        # WITH REPORTING_YEAR ARG
        ry = ComplianceTestHelper.build_initial_compliance_report(reporting_year=2666)
        print("\nreporting_year ARG PASSED TO BUILDER: ")
        print(f'REPORTING YEAR = {ry.reporting_year.reporting_year}')
        print(f'COMPLIANCE DEADLINE = {ry.compliance_period.compliance_deadline}')
        print(f'COMPLIANCE STATUS = {ry.initial_compliance_report_version.status}')

        assert 1 == 1
