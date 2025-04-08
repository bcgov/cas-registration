from registration.models.operation import Operation
from reporting.models.report_operation import ReportOperation
from reporting.models.report_version import ReportVersion
from reporting.service.report_validation.report_validation_error import (
    ReportValidationError,
    Severity,
)


def validate(report_version: ReportVersion) -> dict[str, ReportValidationError]:
    report_operation: ReportOperation = report_version.report_operation

    errors = {}

    if (
        report_operation.registration_purpose
        in [
            Operation.Purposes.OBPS_REGULATED_OPERATION,
            Operation.Purposes.OPTED_IN_OPERATION,
            Operation.Purposes.NEW_ENTRANT_OPERATION,
        ]
        and not report_operation.bc_obps_regulated_operation_id
    ):
        errors["operation_boro_id"] = ReportValidationError(
            Severity.ERROR,
            "Report is missing BORO ID, please make sure one has been assigned to your operation.",
        )

    return errors
