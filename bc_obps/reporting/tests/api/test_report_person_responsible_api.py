from registration.tests.utils.helpers import CommonTestSetup
from reporting.tests.utils.report_access_validation import assert_report_version_ownership_is_validated


class TestReportPersonResponsibleEndpoints(CommonTestSetup):
    def test_validates_report_version_id(self):
        assert_report_version_ownership_is_validated("get_report_person_responsible_by_version_id")
        assert_report_version_ownership_is_validated("save_report_contact", method="post")
