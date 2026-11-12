from registration.tests.utils.helpers import CommonTestSetup
from reporting.tests.utils.report_access_validation import assert_report_version_ownership_is_validated
from rls.utils.manager import RlsManager


class TestReportPersonResponsibleEndpoints(CommonTestSetup):
    def test_validates_report_version_id(self):
        with RlsManager.bypass_rls():
            assert_report_version_ownership_is_validated("get_report_person_responsible_by_version_id")
        with RlsManager.bypass_rls():
            assert_report_version_ownership_is_validated("save_report_contact", method="post")
