from django.db.models import QuerySet, Sum
from reporting.models.emission_category import EmissionCategory
from reporting.models.facility_report import FacilityReport
from reporting.models.report_emission import ReportEmission
from reporting.models.report_version import ReportVersion
from reporting.service.report_validation.report_validation_error import (
    ErrorContext,
    ReportValidationError,
    ReportValidationErrorKey,
    Severity,
)
from reporting.service.report_validation.report_validation_tags import ValidationTags

TAGS = [ValidationTags.REPORT_VALIDATION]


def validate(report_version: ReportVersion) -> dict[str, ReportValidationError]:
    """
    Validator returning a warning if:
    - the emissions allocated to the O&G non-processing, non-combustion activity aren't equal to the
      emissions reported under the "other_excluded" category.

    """
    other_excluded_categories = EmissionCategory.objects.filter(category_name="other_excluded")
    facility_reports: QuerySet[FacilityReport] = report_version.facility_reports.all()

    errors = {}

    for fr in facility_reports:
        other_excluded_emissions = (
            ReportEmission.objects_with_decimal_emissions.select_related("report_source_type__report_activity")
            .filter(
                emission_categories__in=other_excluded_categories,
                report_source_type__report_activity__facility_report_id=fr.id,
            )
            .aggregate(Sum("emission"))['emission__sum']
        )

        o_and_g_non_processing_activity_emissions = (
            ReportEmission.objects_with_decimal_emissions.select_related("report_source_type__report_activity")
            .filter(report_source_type__report_activity__activity__slug="og_extraction_non_compression")
            .aggregate(Sum("emission"))['emission__sum']
        )

        if other_excluded_emissions != o_and_g_non_processing_activity_emissions:
            errors[f"o&g_np_nc_allocation_mismatch_{fr.facility_id}"] = ReportValidationError(
                key=ReportValidationErrorKey.ONG_NP_NC_ALLOCATION_MISMATCH,
                message="Emissions allocated to the O&G non-processing, non-combustion activity aren't equal to the emissions reported under the 'other_excluded' category.",
                severity=Severity.WARNING,
                context=ErrorContext(
                    report_version_id=report_version.id,
                    facility_id=fr.facility_id,
                    facility_name=fr.facility_name,
                ),
            )

    return errors
