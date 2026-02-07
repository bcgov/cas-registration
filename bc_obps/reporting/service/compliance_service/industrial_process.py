from decimal import Decimal
from reporting.models.report_product import ReportProduct
from reporting.service.compliance_service import ComplianceService
from reporting.service.emission_category_service import EmissionCategoryService


def compute_industrial_process_emissions(rp: ReportProduct) -> Decimal:

    industrial_process = ComplianceService.get_allocated_emissions_by_report_product_emission_category(
        rp.report_version.id, rp.product_id, [3]
    )  # ID=3 is Industrial Emissions category

    # Handle Pulp & Paper specific edge case:
    # Subtract the sum of emissions that were categorized as industrial_process & (woody_biomass or other_excluded_biomass) from
    # the industrial_process emission total attributed to the product "Pulp and paper: chemical pulp".

    """
    TODO
    This is where we need to:
    - for chemical pulp, take the (industrial process for chem pulp + lime recovery kikn) overlapping * percentage associated and remove from industrial process
    - for lime recovery kiln, take the overlapping * percentage associated and remove from industrial process
    """

    if (
        rp.report_version.report.operation.naics_code
        and rp.report_version.report.operation.naics_code.naics_code.startswith("322")
    ):
        raise
        # split = rp.report_version.reportactivity_records.filter(
        #     lambda ra: ra.activity.name == "pulp and paper production"
        # )

        overlapping_industrial_process_emissions = (
            EmissionCategoryService.get_industrial_process_excluded_biomass_overlap_by_report_version(
                rp.report_version.id
            )
        )
        industrial_process = industrial_process - overlapping_industrial_process_emissions

    return industrial_process
