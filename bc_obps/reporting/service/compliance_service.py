from reporting.models.report_emission import ReportEmission
from reporting.models.report_product_emission_allocation import (
    ReportProductEmissionAllocation,
)
from reporting.models.report_product import ReportProduct
from reporting.models import NaicsRegulatoryValue, ReportVersion
from reporting.models.product_emission_intensity import ProductEmissionIntensity
from reporting.models.emission_category import EmissionCategory
from reporting.service.emission_category_service import EmissionCategoryService
from reporting.models import ReportComplianceSummary, ReportComplianceSummaryProduct
from registration.models import RegulatedProduct
from decimal import Decimal
from django.db.models import Sum
from typing import Dict, List
from django.db import transaction
from dataclasses import dataclass


@dataclass
class RegulatoryValues:
    reduction_factor: Decimal
    tightening_rate: Decimal
    initial_compliance_period: int
    compliance_period: int


@dataclass
class ReportProductComplianceData:
    name: str
    product_id: int
    annual_production: Decimal
    apr_dec_production: Decimal
    emission_intensity: Decimal
    allocated_industrial_process_emissions: Decimal
    allocated_compliance_emissions: Decimal


@dataclass
class ComplianceData:
    emissions_attributable_for_reporting: Decimal
    reporting_only_emissions: Decimal
    emissions_attributable_for_compliance: Decimal
    emissions_limit: Decimal
    excess_emissions: Decimal
    credited_emissions: Decimal
    regulatory_values: RegulatoryValues
    products: List[ReportProductComplianceData]


class ComplianceService:
    """
    Service that fetches the data & performs the calculations necessary for the compliance summary
    """

    @staticmethod
    def get_regulatory_values_by_naics_code(report_version_id: int) -> RegulatoryValues:
        data = ReportVersion.objects.select_related('report__operation').get(pk=report_version_id)
        naics_code_id = data.report.operation.naics_code_id
        compliance_year = data.report.reporting_year.reporting_year
        regulatory_values = NaicsRegulatoryValue.objects.get(
            naics_code_id=naics_code_id,
            valid_from__lte=data.report.reporting_year.reporting_window_start,
            valid_to__gte=data.report.reporting_year.reporting_window_end,
        )

        return RegulatoryValues(
            reduction_factor=regulatory_values.reduction_factor,
            tightening_rate=regulatory_values.tightening_rate,
            initial_compliance_period=2024,
            compliance_period=compliance_year,
        )

    @staticmethod
    def get_emissions_attributable_for_reporting(report_version_id: int) -> Decimal:
        records = ReportEmission.objects_with_decimal_emissions.filter(
            report_version_id=report_version_id,
            emission_categories__category_type='basic',
        )
        attributable_sum = records.aggregate(emission_sum=Sum('emission'))

        return attributable_sum['emission_sum'] or Decimal('0')

    @staticmethod
    def get_production_totals(report_version_id: int) -> Dict[str, Decimal]:
        records = ReportProduct.objects.filter(
            report_version_id=report_version_id,
        )
        annual_production_sum = records.aggregate(production_sum=Sum('annual_production'))
        apr_dec_sum = records.aggregate(production_sum=Sum('production_data_apr_dec'))

        return {
            "annual_amount": annual_production_sum['production_sum'] or Decimal('0'),
            "apr_dec": apr_dec_sum['production_sum'] or Decimal('0'),
        }

    @staticmethod
    def get_allocated_emissions_by_report_product_emission_category(
        report_version_id: int, product_id: int, emission_category_ids: List[int]
    ) -> Decimal:
        records = ReportProductEmissionAllocation.objects.filter(
            report_version_id=report_version_id,
            report_product__product_id=product_id,
            emission_category_id__in=emission_category_ids,
        )
        allocated_to_category_sum = records.aggregate(production_sum=Sum('allocated_quantity'))

        return allocated_to_category_sum['production_sum'] or Decimal('0')

    @staticmethod
    def get_report_product_aggregated_totals(report_version_id: int, product_id: int) -> Dict[str, Decimal]:
        records = ReportProduct.objects.filter(
            report_version_id=report_version_id,
            product_id=product_id,
        )
        product_annual_amount_sum = records.aggregate(production_sum=Sum('annual_production'))
        apr_dec_sum = records.aggregate(production_sum=Sum('production_data_apr_dec'))

        return {
            "annual_amount": product_annual_amount_sum['production_sum'] or Decimal('0'),
            "apr_dec": apr_dec_sum['production_sum'] or Decimal('0'),
        }

    @staticmethod
    def get_reporting_only_allocated(report_version_id: int, product_id: int) -> Decimal:
        # CO2 emissions from excluded woody biomass, Other emissions from excluded biomass, Emissions from excluded non-biomass, Fugitive emissions, Venting emissions — non-useful
        reporting_only_category_ids = [10, 11, 12, 2, 7]
        reporting_only_allocated = ComplianceService.get_allocated_emissions_by_report_product_emission_category(
            report_version_id, product_id, reporting_only_category_ids
        )
        return reporting_only_allocated

    @staticmethod
    def get_unregulated_products_allocated(report_version_id: int) -> Decimal:
        unregulated_product_allocation_records = ReportProductEmissionAllocation.objects.filter(
            report_version_id=report_version_id,
            report_product__product__is_regulated=False,
        )
        return unregulated_product_allocation_records.aggregate(allocated_sum=Sum("allocated_quantity"))[
            "allocated_sum"
        ] or Decimal("0")

    @staticmethod
    def calculate_product_emission_limit(
        pwaei: Decimal,
        apr_dec_production: Decimal,
        allocated_industrial_process: Decimal,
        allocated_for_compliance: Decimal,
        tightening_rate: Decimal,
        reduction_factor: Decimal,
        compliance_period: int,
        initial_compliance_period: int = 2024,
    ) -> Decimal:
        # Handle divide by 0 error if allocated_for_compliance is 0
        industrial_process_compliance_allocated_division = Decimal('0')
        if allocated_for_compliance > 0:
            industrial_process_compliance_allocated_division = allocated_industrial_process / allocated_for_compliance

        product_emission_limit = (apr_dec_production * pwaei) * (
            reduction_factor
            - (
                (Decimal('1') - (industrial_process_compliance_allocated_division))
                * tightening_rate
                * (compliance_period - initial_compliance_period)
            )
        )
        return product_emission_limit

    @classmethod
    def get_calculated_compliance_data(cls, report_version_id: int) -> ComplianceData:
        naics_data = ComplianceService.get_regulatory_values_by_naics_code(report_version_id)
        registration_purpose = ReportVersion.objects.get(pk=report_version_id).report.operation.registration_purpose
        ##### Don't use schemas, use classes or dicts
        compliance_product_list: List[ReportProductComplianceData] = []
        total_allocated_reporting_only = Decimal(0)
        total_allocated_for_compliance = Decimal(0)
        total_allocated_for_compliance_2024 = Decimal(0)
        emissions_limit_total = Decimal(0)

        report_products = (
            ReportProduct.objects.order_by("product_id")
            .filter(report_version_id=report_version_id, product__is_regulated=True)
            .distinct('product_id')
        )
        # Iterate on all products reported (by product ID)
        for rp in report_products:
            ei = ProductEmissionIntensity.objects.get(
                product_id=rp.product_id
                # TEMPORAL CHECKS
            ).product_weighted_average_emission_intensity
            industrial_process = ComplianceService.get_allocated_emissions_by_report_product_emission_category(
                report_version_id, rp.product_id, [3]
            )  # ID=3 is Industrial Emissions category

            # Handle Pulp & Paper specific edge case:
            # Subtract the sum of emissions that were categorized as industrial_process & (woody_biomass or other_excluded_biomass) from
            # the industrial_process emission total attributed to the product "Pulp and paper: chemical pulp".
            if (
                rp.report_version.report.operation.naics_code
                and rp.report_version.report.operation.naics_code.naics_code.startswith('322')
                and rp.product.name == 'Pulp and paper: chemical pulp'
            ):
                overlapping_industrial_process_emissions = (
                    EmissionCategoryService.get_industrial_process_excluded_biomass_overlap_by_report_version(
                        report_version_id
                    )
                )
                industrial_process = industrial_process - overlapping_industrial_process_emissions

            production_totals = ComplianceService.get_report_product_aggregated_totals(report_version_id, rp.product_id)
            allocated = ComplianceService.get_allocated_emissions_by_report_product_emission_category(
                report_version_id,
                rp.product_id,
                list(EmissionCategory.objects.filter(category_type='basic').values_list('id', flat=True)),
            )
            allocated_reporting_only = ComplianceService.get_reporting_only_allocated(report_version_id, rp.product_id)
            allocated_for_compliance = allocated - allocated_reporting_only
            allocated_for_compliance_2024 = (
                allocated_for_compliance / Decimal(production_totals["annual_amount"])
            ) * Decimal(production_totals["apr_dec"])
            product_emission_limit = ComplianceService.calculate_product_emission_limit(
                pwaei=ei,
                apr_dec_production=Decimal(production_totals["apr_dec"]),
                allocated_industrial_process=Decimal(industrial_process),
                allocated_for_compliance=Decimal(allocated_for_compliance),
                tightening_rate=naics_data.tightening_rate,
                reduction_factor=naics_data.reduction_factor,
                compliance_period=naics_data.compliance_period,
            )

            # Add individual product amounts to totals
            total_allocated_reporting_only += allocated_reporting_only
            total_allocated_for_compliance += allocated_for_compliance
            total_allocated_for_compliance_2024 += allocated_for_compliance_2024
            emissions_limit_total += product_emission_limit

            # Add product to list of products
            compliance_product_list.append(
                ReportProductComplianceData(
                    name=rp.product.name,
                    product_id=rp.product_id,
                    annual_production=production_totals["annual_amount"],
                    apr_dec_production=production_totals["apr_dec"],
                    emission_intensity=ei,
                    allocated_industrial_process_emissions=industrial_process,
                    allocated_compliance_emissions=round(allocated_for_compliance_2024, 4),
                )
            )

        # Emissions allocated to unregulated products
        total_allocated_unregulated_products = ComplianceService.get_unregulated_products_allocated(report_version_id)
        total_allocated_reporting_only += total_allocated_unregulated_products

        # Get attributable emission total
        attributable_for_reporting_total = ComplianceService.get_emissions_attributable_for_reporting(report_version_id)
        # Calculated Excess/credited emissions
        excess_emissions = Decimal(0)
        credited_emissions = Decimal(0)
        if total_allocated_for_compliance_2024 > emissions_limit_total:
            excess_emissions = total_allocated_for_compliance_2024 - emissions_limit_total
        else:
            credited_emissions = emissions_limit_total - total_allocated_for_compliance_2024

        if registration_purpose == 'New Entrant Operation':
            total_allocated_for_compliance_2024 = Decimal(0)
            emissions_limit_total = Decimal(0)
            excess_emissions = Decimal(0)
            credited_emissions = Decimal(0)
        # Craft return object with all data
        return_object = ComplianceData(
            emissions_attributable_for_reporting=attributable_for_reporting_total,
            reporting_only_emissions=round(Decimal(total_allocated_reporting_only), 4),
            emissions_attributable_for_compliance=round(total_allocated_for_compliance_2024, 4),
            emissions_limit=round(emissions_limit_total, 4),
            excess_emissions=round(excess_emissions, 4),
            credited_emissions=round(credited_emissions, 4),
            regulatory_values=naics_data,
            products=compliance_product_list,
        )

        return return_object

    @classmethod
    @transaction.atomic()
    def save_compliance_data(cls, report_version_id: int) -> None:
        compliance_data_to_save = ComplianceService.get_calculated_compliance_data(report_version_id)
        compliance_summary_record_id = None
        report_version_record = ReportVersion.objects.get(id=report_version_id)
        if ReportComplianceSummary.objects.filter(report_version_id=report_version_id).exists():
            compliance_summary_record_id = ReportComplianceSummary.objects.get(report_version_id=report_version_id).id
        compliance_summary_record, _ = ReportComplianceSummary.objects.update_or_create(
            id=compliance_summary_record_id,
            report_version=report_version_record,
            defaults={
                "emissions_attributable_for_reporting": compliance_data_to_save.emissions_attributable_for_reporting,
                "reporting_only_emissions": compliance_data_to_save.reporting_only_emissions,
                "emissions_attributable_for_compliance": compliance_data_to_save.emissions_attributable_for_compliance,
                "emissions_limit": compliance_data_to_save.emissions_limit,
                "excess_emissions": compliance_data_to_save.excess_emissions,
                "credited_emissions": compliance_data_to_save.credited_emissions,
                "reduction_factor": compliance_data_to_save.regulatory_values.reduction_factor,
                "tightening_rate": compliance_data_to_save.regulatory_values.tightening_rate,
                "initial_compliance_period": compliance_data_to_save.regulatory_values.initial_compliance_period,
                "compliance_period": compliance_data_to_save.regulatory_values.compliance_period,
            },
        )
        for product_data_to_save in compliance_data_to_save.products:
            product_data_id = None
            if ReportComplianceSummaryProduct.objects.filter(
                report_version_id=report_version_id, product_id=product_data_to_save.product_id
            ):
                product_data_id = ReportComplianceSummaryProduct.objects.get(
                    report_version_id=report_version_id, product_id=product_data_to_save.product_id
                ).id
            ReportComplianceSummaryProduct.objects.update_or_create(
                id=product_data_id,
                report_version=report_version_record,
                report_compliance_summary=compliance_summary_record,
                product=RegulatedProduct.objects.get(id=product_data_to_save.product_id),
                defaults={
                    "annual_production": product_data_to_save.annual_production,
                    "apr_dec_production": product_data_to_save.apr_dec_production,
                    "emission_intensity": product_data_to_save.emission_intensity,
                    "allocated_industrial_process_emissions": product_data_to_save.allocated_industrial_process_emissions,
                    "allocated_compliance_emissions": product_data_to_save.allocated_compliance_emissions,
                },
            )
