from decimal import Decimal
from django.db.models import Q, QuerySet, Sum
from reporting.models import ReportProductEmissionAllocation, ReportProduct, ReportVersion, FacilityReport
from reporting.service.report_validation.report_validation_error import (
    ErrorContext,
    ReportValidationError,
    ReportValidationErrorKey,
    Severity,
)
from reporting.service.report_validation.report_validation_tags import ValidationTags

TAGS = [ValidationTags.REPORT_VALIDATION]


def validate_facility_report(facility_report: FacilityReport) -> dict[str, ReportValidationError]:
    """
    Method validating "other_excluded" emissions for a single facility report.
    """

    facility_report_errors = {}

    for rp in ReportProduct.objects.filter(facility_report=facility_report):
        allocated_to_basic_categories_total = ReportProductEmissionAllocation.objects.select_related(
            "emission_category"
        ).filter(report_product=rp).filter(Q(emission_category__category_type='basic')).aggregate(
            Sum("allocated_quantity")
        )[
            'allocated_quantity__sum'
        ] or Decimal(
            "0"
        )
        allocated_to_excluded_categories_total = ReportProductEmissionAllocation.objects.select_related(
            "emission_category"
        ).filter(report_product=rp).filter(~Q(emission_category__category_type='basic')).aggregate(
            Sum("allocated_quantity")
        )[
            'allocated_quantity__sum'
        ] or Decimal(
            "0"
        )
        if allocated_to_basic_categories_total < allocated_to_excluded_categories_total:
            facility_report_errors[f"product_allocation_mismatch_{facility_report.facility_id}_{rp.product.name}"] = (
                ReportValidationError(
                    key=ReportValidationErrorKey.PRODUCT_EXCLUDED_EMISSION_OVER_ALLOCATION,
                    message=f"The total excluded emissions allocated to '{rp.product.name}' for facility '{facility_report.facility_name}' "
                    f"exceeds the total emissions allocated to '{rp.product.name}' in non-excluded categories ",
                    severity=Severity.ERROR,
                    context=ErrorContext(
                        report_version_id=facility_report.report_version_id,
                        facility_id=facility_report.facility_id,
                        facility_name=facility_report.facility_name,
                        product_name=rp.product.name,
                    ),
                )
            )

    return facility_report_errors


def validate(report_version: ReportVersion) -> dict[str, ReportValidationError]:
    """
    Validator returning a collection of warnings, for each facility report, if:
    - the total emissions allocated to excluded categories for a product exceed the
      emissions reported under the total for basic categories.

    """
    facility_reports: QuerySet[FacilityReport] = report_version.facility_reports.all()
    errors: dict[str, ReportValidationError] = {}

    for fr in facility_reports:
        errors = {**errors, **validate_facility_report(fr)}

    return errors
