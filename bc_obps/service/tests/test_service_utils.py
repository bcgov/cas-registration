from django.test import TestCase
from reporting.tests.utils.bakers import report_version_baker
from service.utils.get_report_valid_year_from_version_id import get_report_valid_year_from_version_id
from service.utils.constants import REPORT_VERSION_DATE_SUFFIX


class TestServiceUtils(TestCase):
    def test_get_report_valid_year_from_version_id(self):
        report_version = report_version_baker()
        assert (
            get_report_valid_year_from_version_id(report_version.id)
            == f"{report_version.report.reporting_year_id}{REPORT_VERSION_DATE_SUFFIX}"
        )
