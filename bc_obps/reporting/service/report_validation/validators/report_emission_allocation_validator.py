from reporting.models.facility_report import FacilityReport
from reporting.models.report_version import ReportVersion
from reporting.service.report_emission_allocation_service import ReportEmissionAllocationService
from reporting.service.report_validation.report_validation_error import (
    ReportValidationError,
    Severity,
)


def validate(report_version: ReportVersion) -> dict[str, ReportValidationError]:

    facility_reports = FacilityReport.objects.filter(report_version=report_version)

    errors = {}

    for fr in facility_reports:
        emission_data = ReportEmissionAllocationService.get_emission_allocation_data(report_version.id, fr.facility_id)
        for category in emission_data.report_product_emission_allocations:
            total_allocated = sum(product.allocated_quantity for product in category.products)
            if total_allocated != category.emission_total:
                errors[
                    f"facility_{fr.facility_id}_category_{category.emission_category_id}_allocation_mismatch"
                ] = ReportValidationError(
                    Severity.ERROR,
                    f"Allocated emissions for {fr.facility_name} in '{category.emission_category_name}' category do not match reported emissions.",
                )
    return errors
