# Example implementation:
#
# from reporting.models.report_version import ReportVersion
# from reporting.service.report_validation.report_validation_error import (
#     ReportValidationError,
#     Severity,
# )

# The list of TAGS define where this validator should run.
# For example the ON_SUBMIT tag will cause this validator to run when called from the report version submission function.
# TAGS = [ValidationTags.ON_SUBMIT]
#
# def validate(report_version: ReportVersion) -> dict[str, ReportValidationError]:
#     return {"example": ReportValidationError(Severity.ERROR, "This is an example.")}
#
