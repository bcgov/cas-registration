from reporting.models.report_version import ReportVersion


def test_validator(report_version: ReportVersion) -> bool:
    return report_version.id == 1
