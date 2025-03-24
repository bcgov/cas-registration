from registration.tests.utils.helpers import CommonTestSetup
from reporting.tests.utils.report_access_validation import (
    assert_report_version_ownership_is_validated,
)


class TestReportEmissionSummaryEndpoints(CommonTestSetup):
    def test_validates_report_version_id(self):
        assert_report_version_ownership_is_validated("get_emission_summary_totals", facility_id="uuid")
        assert_report_version_ownership_is_validated("get_operation_emission_summary_totals")
