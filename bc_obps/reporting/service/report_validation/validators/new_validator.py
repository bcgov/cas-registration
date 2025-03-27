from reporting.models.report_version import ReportVersion
from reporting.service.report_validation.report_validation_result import (
    ReportValidationResult,
)


def validate(report_version: ReportVersion) -> ReportValidationResult:
    return ReportValidationResult(False, {"fails_all_the_time": "Yes!"})
