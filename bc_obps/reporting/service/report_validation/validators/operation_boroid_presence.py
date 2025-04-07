from reporting.models.report_operation import ReportOperation
from reporting.models.report_version import ReportVersion
from reporting.service.report_validation.report_validation_error import (
    ReportValidationError,
    Severity,
)


def validate(report_version: ReportVersion) -> dict[str, ReportValidationError]:
    report_operation: ReportOperation = report_version.report_operation

    errors = {}

    if not report_operation.bc_obps_regulated_operation_id:
        errors["operation_boro_id"] = ReportValidationError(
            Severity.ERROR,
            "Report is missing BORO ID, please make sure one has been assigned to your operation.",
        )

    return errors
