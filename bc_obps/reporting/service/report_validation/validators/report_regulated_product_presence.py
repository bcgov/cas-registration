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

TAGS = [ValidationTags.REPORT_VALIDATION]

REGULATED_OPERATION_PURPOSES = [
    Operation.Purposes.OBPS_REGULATED_OPERATION,
    Operation.Purposes.OPTED_IN_OPERATION,
    Operation.Purposes.NEW_ENTRANT_OPERATION,
]


def validate(report_version: ReportVersion) -> dict[str, ReportValidationError]:
    report_operation: ReportOperation = report_version.report_operation

    errors = {}

    is_regulated_operation = report_operation.registration_purpose in REGULATED_OPERATION_PURPOSES

    has_regulated_product = report_operation.regulated_products.filter(is_regulated=True).exists()

    if is_regulated_operation and not has_regulated_product:
        errors["missing_regulated_products"] = ReportValidationError(
            severity=Severity.WARNING,
            message=(
                "No regulated products selected on Review Operation Information. "
                "Expected one or more regulated products to be selected. "
                "If the correct products are selected, you may continue."
            ),
            key=ReportValidationErrorKey.MISSING_REGULATED_PRODUCT,
            context=ErrorContext(report_version_id=report_version.id),
        )

    return errors
