from dataclasses import dataclass
from decimal import Decimal
import logging
from registration.models.activity import Activity
from reporting.models.report_activity import ReportActivity
from reporting.models.report_product import ReportProduct
from reporting.service.compliance_service.emission_allocation import (
    get_allocated_emissions_by_report_product_emission_category,
)
from reporting.service.emission_category_service import EmissionCategoryService

logger = logging.getLogger(__name__)


@dataclass
class BiogenicEmissionsSplit:
    chemical_pulp_ratio: Decimal
    lime_recovered_by_kiln_ratio: Decimal

    def __post_init__(self) -> None:
        if not self.chemical_pulp_ratio + self.lime_recovered_by_kiln_ratio == Decimal('1'):
            raise ValueError("The biogenic emissions split reported must total to 1.")


def retrieve_pulp_and_paper_biogenic_emissions_split(report_version_id: int) -> BiogenicEmissionsSplit:
    # return BiogenicEmissionsSplit(chemical_pulp_ratio=Decimal('0.4'), lime_recovery_kiln_ratio=Decimal('0.6'))

    try:
        report_activity = ReportActivity.objects.get(
            report_version_id=report_version_id, activity=Activity.objects.get(slug='pulp_and_paper')
        )
    except ReportActivity.DoesNotExist:
        raise ReportActivity.DoesNotExist(
            'Under NAICS code 322112, there must be emissions reported under the "Pulp and Paper production" activity.'
        )

    try:
        if not report_activity.json_data["biogenicIndustrialProcessEmissions"]["doesUtilizeLimeRecoveryKiln"]:
            raise ValueError(
                """Under NAICS code 322112 and with either 'chemical pulp' or 'lime recovered by kiln' products,
                biogenic industrial process emission details must be reported."""
            )

        split_data = report_activity.json_data["biogenicIndustrialProcessEmissions"]["biogenicEmissionsSplit"]
        chemical_pulp_percentage = Decimal(split_data["chemicalPulpPercentage"])
        lime_recovered_by_kiln_percentage = Decimal(split_data["limeRecoveredByKilnPercentage"])

    except KeyError as e:
        # Issues with the format of the data
        raise KeyError(f"Biogenic industrial process emissions data: key error at {str(e)}")

    return BiogenicEmissionsSplit(
        chemical_pulp_percentage / Decimal(100.0), lime_recovered_by_kiln_percentage / Decimal(100.0)
    )


def compute_industrial_process_emissions(rp: ReportProduct) -> Decimal:

    industrial_process = get_allocated_emissions_by_report_product_emission_category(
        rp.report_version_id, rp.product_id, [3]
    )  # ID=3 is Industrial Emissions category

    # Handle Pulp & Paper specific edge case:
    # Subtract the sum of emissions that were categorized as industrial_process & (woody_biomass or other_excluded_biomass) from
    # the industrial_process emission total attributed to the product "Pulp and paper: chemical pulp".

    if (
        rp.report_version.report.operation.naics_code
        and rp.report_version.report.operation.naics_code.naics_code.startswith("322112")
        and rp.product.name in ["Pulp and paper: chemical pulp", "Pulp and paper: lime recovered by kiln"]
    ):
        biogenic_emissions_split = retrieve_pulp_and_paper_biogenic_emissions_split(rp.report_version.id)
        overlapping_industrial_process_emissions = (
            EmissionCategoryService.get_industrial_process_excluded_biomass_overlap_by_report_version(
                rp.report_version.id
            )
        )

        if rp.product.name == "Pulp and paper: chemical pulp":
            return (
                industrial_process
                - overlapping_industrial_process_emissions * biogenic_emissions_split.chemical_pulp_ratio
            )

        if rp.product.name == "Pulp and paper: lime recovered by kiln":
            return (
                industrial_process
                - overlapping_industrial_process_emissions * biogenic_emissions_split.lime_recovered_by_kiln_ratio
            )

    return industrial_process
