from django.test import TestCase
from reporting.tests.utils.report_access_validation import assert_report_version_ownership_is_validated


class TestSubmitEndpoint(TestCase):
    def test_validates_report_version_id(self):
        assert_report_version_ownership_is_validated("submit_report_version", "post")
