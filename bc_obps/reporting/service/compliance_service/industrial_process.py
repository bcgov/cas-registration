from dataclasses import dataclass
import dataclasses
from decimal import Decimal
import logging
from reporting.models.report_product import ReportProduct
from reporting.service.compliance_service.emission_allocation import (
    get_allocated_emissions_by_report_product_emission_category,
)
from reporting.service.emission_category_service import EmissionCategoryService

logger = logging.getLogger(__name__)


@dataclass
class BiogenicEmissionsSplit:
    chemical_pulp_ratio: Decimal
    lime_recovery_kiln_ratio: Decimal

    def __post_init__(self) -> None:
        if not self.chemical_pulp_ratio + self.lime_recovery_kiln_ratio == Decimal('1'):
            raise ValueError("The biogenic emissions split reported must total to 1.")


def retrieve_pulp_and_paper_biogenic_emissions_split(report_version_id: int) -> BiogenicEmissionsSplit:
    logger.error("Biogenic emissions split should be retrieved from the database instead.")
    """
    TODO: When #965 is implemented, update fetching that data from the ReportActivity record.
    """
    return BiogenicEmissionsSplit(chemical_pulp_ratio=Decimal('0.4'), lime_recovery_kiln_ratio=Decimal('0.6'))


def compute_industrial_process_emissions(rp: ReportProduct) -> Decimal:

    industrial_process = get_allocated_emissions_by_report_product_emission_category(
        rp.report_version.id, rp.product_id, [3]
    )  # ID=3 is Industrial Emissions category

    # Handle Pulp & Paper specific edge case:
    # Subtract the sum of emissions that were categorized as industrial_process & (woody_biomass or other_excluded_biomass) from
    # the industrial_process emission total attributed to the product "Pulp and paper: chemical pulp".

    """
    TODO
    This is where we need to:
    - for chemical pulp, take the (industrial process for chem pulp + lime recovery kikn) overlapping * percentage associated and remove from industrial process
    - for lime recovered by kiln, take the overlapping * percentage associated and remove from industrial process
    """

    if (
        rp.report_version.report.operation.naics_code
        and rp.report_version.report.operation.naics_code.naics_code.startswith("322")
        and rp.product.name in ["Pulp and paper: chemical pulp", "Pulp and paper: lime recovered by kiln"]
    ):
        biogenic_emissions_split = retrieve_pulp_and_paper_biogenic_emissions_split(rp.report_version.id)
        overlapping_industrial_process_emissions = (
            EmissionCategoryService.get_industrial_process_excluded_biomass_overlap_by_report_version(
                rp.report_version.id
            )
        )

        print(f"{rp.product.name} biogenic split: {dataclasses.asdict(biogenic_emissions_split)}")
        print(f"{rp.product.name} overlapping industrial process: {overlapping_industrial_process_emissions}")

        if rp.product.name == "Pulp and paper: chemical pulp":
            print(
                f"{rp.product.name} industrial process: {industrial_process - overlapping_industrial_process_emissions * biogenic_emissions_split.chemical_pulp_ratio}"
            )
            return (
                industrial_process
                - overlapping_industrial_process_emissions * biogenic_emissions_split.chemical_pulp_ratio
            )

        if rp.product.name == "Pulp and paper: lime recovered by kiln":
            print(
                f"{rp.product.name} industrial process: {industrial_process - overlapping_industrial_process_emissions * biogenic_emissions_split.lime_recovery_kiln_ratio}"
            )
            return (
                industrial_process
                - overlapping_industrial_process_emissions * biogenic_emissions_split.lime_recovery_kiln_ratio
            )

    print(f"{rp.product.name} industrial process: {industrial_process}")
    return industrial_process
