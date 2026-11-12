from registration.tests.utils.helpers import CommonTestSetup
from reporting.tests.utils.report_access_validation import (
    assert_report_version_ownership_is_validated,
)
from rls.utils.manager import RlsManager


class TestReportEmissionSummaryEndpoints(CommonTestSetup):
    def test_validates_report_version_id(self):
        with RlsManager.bypass_rls():
            assert_report_version_ownership_is_validated("get_emission_summary_totals", facility_id="uuid")
        with RlsManager.bypass_rls():
            assert_report_version_ownership_is_validated("get_operation_emission_summary_totals")
