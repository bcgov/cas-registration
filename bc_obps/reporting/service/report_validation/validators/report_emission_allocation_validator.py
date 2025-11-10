from reporting.models.facility_report import FacilityReport
from reporting.models.report_emission_allocation import ReportEmissionAllocation
from reporting.models.report_version import ReportVersion
from reporting.service.report_emission_allocation_service import ReportEmissionAllocationService
from reporting.service.report_validation.report_validation_error import (
    ReportValidationError,
    Severity,
)


def validate(report_version: ReportVersion) -> dict[str, ReportValidationError]:
    """
    Validates emission allocation data for all facility reports associated with a given report version.

    For each facility report, checks that the sum of allocated emission quantities for each product category
    matches the reported emission total, unless the allocation methodology is "Not applicable".
    Returns a dictionary of errors keyed by facility and emission category if mismatches are found.

    Args:
        report_version (ReportVersion): The report version to validate.

    Returns:
        dict[str, ReportValidationError]: A dictionary of validation errors, keyed by facility and category.
    """
    facility_reports = FacilityReport.objects.filter(report_version=report_version)

    errors: dict[str, ReportValidationError] = {}

    for fr in facility_reports:
        emission_data = ReportEmissionAllocationService.get_emission_allocation_data(report_version.id, fr.facility_id)
        if emission_data.allocation_methodology != ReportEmissionAllocation.AllocationMethodologyChoices.NOT_APPLICABLE:
            for category in emission_data.report_product_emission_allocations:
                total_allocated = sum(product.allocated_quantity for product in category.products)
                if total_allocated != category.emission_total:
                    errors[
                        f"allocation_mismatch_facility_{fr.facility_id}_category_{category.emission_category_id}"
                    ] = ReportValidationError(
                        Severity.ERROR,
                        f"Emissions allocated for {fr.facility_name} in '{category.emission_category_name}' category do not match reported emissions. Please correct this issue on the Allocation of Emissions page.",
                    )
    return errors
