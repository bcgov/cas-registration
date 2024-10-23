from reporting.tests.utils.bakers import report_version_baker
from service.utils import get_report_valid_year_from_version_id, REPORT_VERSION_DATE_SUFFIX


def test_get_report_valid_year_from_version_id(self):
    report_version = report_version_baker()
    assert (
        get_report_valid_year_from_version_id(report_version.id)
        == f"{report_version.report.reporting_year_id}{REPORT_VERSION_DATE_SUFFIX}"
    )
