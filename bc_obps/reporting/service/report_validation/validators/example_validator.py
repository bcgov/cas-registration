# Example implementation:
#
# from reporting.models.report_version import ReportVersion
# from reporting.service.report_validation.report_validation_error import (
#     ReportValidationError,
#     Severity,
# )
#
# def validate(report_version: ReportVersion) -> dict[str, ReportValidationError]:
#     return {"example": ReportValidationError(Severity.ERROR, "This is an example.")}
#
