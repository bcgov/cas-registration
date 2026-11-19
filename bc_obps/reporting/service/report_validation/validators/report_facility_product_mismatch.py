from reporting.models.report_operation import ReportOperation
from reporting.models.report_version import ReportVersion
from reporting.service.report_product_service import ReportProductService
from reporting.service.report_validation.report_validation_error import (
    ErrorContext,
    ReportValidationError,
    ReportValidationErrorKey,
    Severity,
)
from reporting.service.report_validation.report_validation_tags import ValidationTags

TAGS = [ValidationTags.REPORT_VALIDATION, ValidationTags.ON_SUBMIT]


def validate(report_version: ReportVersion) -> dict[str, ReportValidationError]:
    """
    Errors for each product that is no longer selected on Review Operation Information
    but still has reported data in one or more facility reports, whether or not they are complete.
    """
    errors: dict[str, ReportValidationError] = {}

    try:
        report_operation: ReportOperation = report_version.report_operation
    except ReportOperation.DoesNotExist:
        return errors

    rows = (
        ReportProductService.get_reported_products(report_version.id)
        .exclude(product_id__in=report_operation.regulated_products.values("id"))
        .order_by("product__name", "facility_report__facility_name")
        .values_list("product_id", "product__name", "facility_report__facility_name")
    )

    facilities_by_product: dict[int, tuple[str, list[str]]] = {}
    for product_id, product_name, facility_name in rows:
        facilities_by_product.setdefault(product_id, (product_name, []))[1].append(facility_name)

    for product_id, (product_name, facility_names) in facilities_by_product.items():
        facilities = ", ".join(facility_names)
        errors[f"product_not_in_operation_information_product_{product_id}"] = ReportValidationError(
            severity=Severity.ERROR,
            message=(
                f"{product_name} is not selected as a product on Review Operation Information "  # nosec B608 - user-facing message, not SQL
                f"but is still selected on the {facilities} report. "
                "To proceed, either select the product on the Review Operation Information page, "
                f"or deselect them from {facilities} report."
            ),
            key=ReportValidationErrorKey.PRODUCT_NOT_IN_OPERATION_INFORMATION,
            context=ErrorContext(report_version_id=report_version.id),
        )

    return errors
