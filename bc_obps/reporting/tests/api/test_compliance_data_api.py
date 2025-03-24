from registration.tests.utils.helpers import CommonTestSetup
from reporting.tests.utils.report_access_validation import assert_report_version_ownership_is_validated


class TestComplianceDataEndpoints(CommonTestSetup):
    def test_validates_report_version_id(self):
        assert_report_version_ownership_is_validated(
            "get_compliance_summary_data", version_id_param_name="report_version_id"
        )
