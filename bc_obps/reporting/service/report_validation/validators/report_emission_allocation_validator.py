from typing import ClassVar
from reporting.models.facility_report import FacilityReport
from reporting.models.report_emission_allocation import ReportEmissionAllocation
from reporting.models.report_version import ReportVersion
from reporting.service.report_emission_allocation_service import ReportEmissionAllocationService
from reporting.service.report_validation.report_validation_error import (
    ErrorContext,
    ReportValidationError,
    ReportValidationErrorKey,
    Severity,
)
from reporting.service.report_validation.report_validation_tags import ValidationTags
from reporting.service.report_validation.validators.base import ReportValidator
from reporting.service.reporting_flow_service import ReportingFlow


class ReportEmissionAllocationValidator(ReportValidator):
    """
    Validates emission allocation data for all facility reports associated with a given report version.

    For each facility report, checks that the sum of allocated emission quantities for each product category
    matches the reported emission total, unless the allocation methodology is "Not applicable".
    Returns a dictionary of errors keyed by facility and emission category if mismatches are found.
    This validation only applies to regulated operations.
    """

    TAGS: ClassVar[list[ValidationTags]] = [ValidationTags.REPORT_VALIDATION, ValidationTags.ON_SUBMIT]

    @classmethod
    def validate(
        cls,
        report_version: ReportVersion,
        flow: ReportingFlow | None = None,
    ) -> dict[str, ReportValidationError]:
        errors: dict[str, ReportValidationError] = {}

        if not report_version.report.operation.is_regulated_operation:
            return errors

        facility_reports = FacilityReport.objects.filter(report_version=report_version)

        for facility_report in facility_reports:
            emission_data = ReportEmissionAllocationService.get_emission_allocation_data(
                report_version.id,
                facility_report.facility_id,
            )

            if (
                emission_data.allocation_methodology
                == ReportEmissionAllocation.AllocationMethodologyChoices.NOT_APPLICABLE
            ):
                continue

            for category in emission_data.report_product_emission_allocations:
                total_allocated = sum(product.allocated_quantity for product in category.products)

                if total_allocated == category.emission_total:
                    continue

                error_key = (
                    f"allocation_mismatch_facility_{facility_report.facility_id}"
                    f"_category_{category.emission_category_id}"
                )

                errors[error_key] = ReportValidationError(
                    Severity.ERROR,
                    (
                        f"Emissions reported for {facility_report.facility_name} in "
                        f"'{category.emission_category_name}' category do not match emissions "
                        "allocated on the Allocation of Emissions page."
                    ),
                    key=ReportValidationErrorKey.ALLOCATION_MISMATCH,
                    context=ErrorContext(
                        report_version_id=report_version.id,
                        facility_id=facility_report.facility_id,
                        facility_name=facility_report.facility_name,
                        emission_category_id=category.emission_category_id,
                        emission_category_name=category.emission_category_name,
                    ),
                )

        return errors
