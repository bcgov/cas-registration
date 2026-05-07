from decimal import Decimal
from django.db.models import QuerySet, Sum
from reporting.models.emission_category import EmissionCategory
from reporting.models.facility_report import FacilityReport
from reporting.models.report_emission import ReportEmission
from reporting.models.report_product_emission_allocation import ReportProductEmissionAllocation
from reporting.models.report_version import ReportVersion
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

    For each basic category:
        A = Total of emissions reported with that basic + any other_excluded category
        B = Total amount allocated to that basic category and and any non-regulated product∂

        We validate that A < B (we can't allocate more emissions than available for that basic category)
    """

    basic_categories = EmissionCategory.objects.filter(category_type="basic")

    # Optimization possible:
    # Rewrite this with a single django query, joining the ReportEmission and ReportProductEmissionAllocation tables,
    # grouping by basic category, and comparing the sums in Python.

    for cat in basic_categories:
        other_excluded_emission_total = (
            ReportEmission.objects_with_decimal_emissions.select_related("report_source_type__report_activity")
            .filter(report_source_type__report_activity__facility_report_id=facility_report.id)
            .filter(emission_categories=cat)
            .filter(emission_categories__category_type="other_excluded")
            .aggregate(Sum("emission"))['emission__sum']
        ) or Decimal("0")

        allocated_to_non_reg_products = ReportProductEmissionAllocation.objects.filter(
            report_product__product__is_regulated=False,
            emission_category=cat,
            report_emission_allocation__facility_report_id=facility_report.id,
        ).aggregate(Sum("allocated_quantity"))['allocated_quantity__sum'] or Decimal("0")

        if other_excluded_emission_total < allocated_to_non_reg_products:
            return {
                f"og_np_nc_allocation_mismatch_{facility_report.facility_id}_{cat.category_name}": ReportValidationError(
                    key=ReportValidationErrorKey.OG_NP_NC_ALLOCATION_MISMATCH,
                    message=f"For the emission category '{cat.category_name}', emissions allocated to the O&G non-processing, non-combustion product exceed the emissions reported under the 'other_excluded' category.",
                    severity=Severity.WARNING,
                    context=ErrorContext(
                        report_version_id=facility_report.report_version_id,
                        facility_id=facility_report.facility_id,
                        facility_name=facility_report.facility_name,
                    ),
                )
            }

    return {}


def validate(report_version: ReportVersion) -> dict[str, ReportValidationError]:
    """
    Validator returning a collection of warnings, for each facility report, if:
    - the emissions allocated to the O&G non-processing, non-combustion activity aren't equal to the
      emissions reported under the "other_excluded" category.

    """
    facility_reports: QuerySet[FacilityReport] = report_version.facility_reports.all()
    errors: dict[str, ReportValidationError] = {}

    for fr in facility_reports:
        errors = {**errors, **validate_facility_report(fr)}

    return errors
