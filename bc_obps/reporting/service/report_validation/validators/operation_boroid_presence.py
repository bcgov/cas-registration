from registration.models.operation import Operation
from reporting.models.report_operation import ReportOperation
from reporting.models.report_version import ReportVersion
from reporting.service.report_validation.report_validation_error import (
    ErrorContext,
    ReportValidationError,
    ReportValidationErrorKey,
    Severity,
)
from reporting.service.report_validation.report_validation_tags import ValidationTags

TAGS = [ValidationTags.ON_SUBMIT]


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
            severity=Severity.ERROR,
            message="Missing BORO ID: A BORO ID is required to submit this report. If you do not have a BORO ID, please wait for it to be issued. If you have been issued a BORO ID, return to Review Operation Information and click 'Sync latest changes from administration' to resolve this error.",
            key=ReportValidationErrorKey.OPERATION_BORO_ID,
            context=ErrorContext(report_version_id=report_version.id),
        )

    return errors
