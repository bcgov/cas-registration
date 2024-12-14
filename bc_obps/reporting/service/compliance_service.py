from reporting.models.report_emission import ReportEmission
from reporting.models.report_product_emission_allocation import ReportProductEmissionAllocation
from reporting.models.report_product import ReportProduct
from reporting.models import NaicsRegulatoryValue, ReportVersion
from reporting.schema.compliance_data import RegulatoryValueSchema
from reporting.schema.compliance_data import ReportProductComplianceSchema, ComplianceDataSchemaOut
from reporting.models.product_emission_intensity import ProductEmissionIntensity
from reporting.models.emission_category import EmissionCategory
from decimal import Decimal
from django.db.models import Sum
from typing import Dict, List


class ComplianceService:
    """
    Service that fetches the data & performs the calculations necessary for the compliance summary
    """

    @staticmethod
    def get_regulatory_values_by_naics_code(report_version_id: int) -> RegulatoryValueSchema:
        data = ReportVersion.objects.select_related('report__operation').get(pk=report_version_id)
        naics_code_id = data.report.operation.naics_code_id
        compliance_year = data.report.reporting_year.reporting_year
        regulatory_values = NaicsRegulatoryValue.objects.get(
            naics_code_id=naics_code_id,
            valid_from__lte=data.report.reporting_year.reporting_window_start,
            valid_to__gte=data.report.reporting_year.reporting_window_end,
        )

        return RegulatoryValueSchema(
            reduction_factor=regulatory_values.reduction_factor,
            tightening_rate=regulatory_values.tightening_rate,
            initial_compliance_period=2024,
            compliance_period=compliance_year,
        )

    @staticmethod
    def get_emissions_attributable_for_reporting(report_version_id: int) -> Decimal | int:
        records = ReportEmission.objects_with_decimal_emissions.filter(
            report_version_id=report_version_id,
            emission_categories__category_type='basic',
        )
        attributable_sum = records.aggregate(emission_sum=Sum('emission'))

        return attributable_sum['emission_sum'] or 0

    @staticmethod
    def get_production_totals(report_version_id: int) -> Dict[str, Decimal | int]:
        records = ReportProduct.objects.filter(
            report_version_id=report_version_id,
        )
        annual_production_sum = records.aggregate(production_sum=Sum('annual_production'))
        apr_dec_sum = records.aggregate(production_sum=Sum('production_data_apr_dec'))

        return {
            "annual_amount": annual_production_sum['production_sum'] or 0,
            "apr_dec": apr_dec_sum['production_sum'] or 0,
        }

    @staticmethod
    def get_allocated_emissions_by_report_product_emission_category(
        report_version_id: int, product_id: int, emission_category_ids: List[int]
    ) -> Decimal | int:
        records = ReportProductEmissionAllocation.objects.filter(
            report_version_id=report_version_id,
            report_product__product_id=product_id,
            emission_category_id__in=emission_category_ids,
        )
        allocated_to_category_sum = records.aggregate(production_sum=Sum('allocated_quantity'))

        return allocated_to_category_sum['production_sum'] or 0

    @staticmethod
    def get_report_product_aggregated_totals(report_version_id: int, product_id: int) -> Dict[str, Decimal | int]:
        records = ReportProduct.objects.filter(
            report_version_id=report_version_id,
            product_id=product_id,
        )
        product_annual_amount_sum = records.aggregate(production_sum=Sum('annual_production'))
        apr_dec_sum = records.aggregate(production_sum=Sum('production_data_apr_dec'))

        return {
            "annual_amount": product_annual_amount_sum['production_sum'] or 0,
            "apr_dec": apr_dec_sum['production_sum'] or 0,
        }

    @staticmethod
    def get_reporting_only_allocated(report_version_id: int, product_id: int) -> Decimal | int:
        # CO2 emissions from excluded woody biomass, Other emissions from excluded biomass, Emissions from excluded non-biomass, Fugitive emissions, Venting emissions — non-useful
        reporting_only_category_ids = [10, 11, 12, 2, 7]
        reporting_only_allocated = ComplianceService.get_allocated_emissions_by_report_product_emission_category(
            report_version_id, product_id, reporting_only_category_ids
        )
        fog_records = ReportProductEmissionAllocation.objects.filter(
            report_version_id=report_version_id,
            report_product__product_id=39,  # Special Fat, Oil & Grease product
        )
        fog_allocated_amount = fog_records.aggregate(allocated_sum=Sum('allocated_quantity'))
        return reporting_only_allocated + (fog_allocated_amount['allocated_sum'] or 0)

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
        product_emission_limit = (apr_dec_production * pwaei) * (
            reduction_factor
            - (
                (Decimal(1) - (allocated_industrial_process / allocated_for_compliance))
                * tightening_rate
                * (compliance_period - initial_compliance_period)
            )
        )
        return product_emission_limit

    @classmethod
    def get_calculated_compliance_data(cls, report_version_id: int) -> ComplianceDataSchemaOut:
        naics_data = ComplianceService.get_regulatory_values_by_naics_code(report_version_id)
        ##### Don't use schemas, use classes or dicts
        compliance_product_list: List[ReportProductComplianceSchema] = []
        total_allocated_reporting_only = Decimal(0)
        total_allocated_for_compliance = Decimal(0)
        total_allocated_for_compliance_2024 = Decimal(0)
        emissions_limit_total = Decimal(0)

        report_products = (
            ReportProduct.objects.order_by("product_id")
            .filter(report_version_id=report_version_id)
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
            production_totals = ComplianceService.get_report_product_aggregated_totals(report_version_id, rp.product_id)
            allocated = ComplianceService.get_allocated_emissions_by_report_product_emission_category(
                report_version_id, rp.product_id, list(EmissionCategory.objects.all().values_list('id', flat=True))
            )
            allocated_reporting_only = ComplianceService.get_reporting_only_allocated(report_version_id, rp.product_id)
            allocated_for_compliance = allocated - allocated_reporting_only
            allocated_for_compliance_2024 = (
                allocated_for_compliance / Decimal(production_totals["annual_amount"])
            ) * Decimal(production_totals["apr_dec"])
            product_emission_limit = ComplianceService.calculate_product_emission_limit(
                ei,
                Decimal(production_totals["apr_dec"]),
                Decimal(industrial_process),
                Decimal(allocated_for_compliance),
                naics_data.reduction_factor,
                naics_data.tightening_rate,
                naics_data.compliance_period,
            )

            # Add individual product amounts to totals
            total_allocated_reporting_only += allocated_reporting_only
            total_allocated_for_compliance += allocated_for_compliance
            total_allocated_for_compliance_2024 += allocated_for_compliance_2024
            emissions_limit_total += product_emission_limit

            # Add product to list of products
            compliance_product_list.append(
                ReportProductComplianceSchema(
                    name=rp.product.name,
                    annual_production=production_totals["annual_amount"],
                    apr_dec_production=production_totals["apr_dec"],
                    emission_intensity=ei,
                    allocated_industrial_process_emissions=industrial_process,
                    allocated_compliance_emissions=allocated_for_compliance_2024,
                )
            )
        # Get attributable emission total
        attributable_for_reporting_total = ComplianceService.get_emissions_attributable_for_reporting(report_version_id)
        # Calculated Excess/credited emissions
        excess_emissions = Decimal(0)
        credited_emissions = Decimal(0)
        if total_allocated_for_compliance_2024 > emissions_limit_total:
            excess_emissions = total_allocated_for_compliance_2024 - emissions_limit_total
        else:
            credited_emissions = emissions_limit_total - total_allocated_for_compliance_2024
        # Craft return object with all data
        return_object = ComplianceDataSchemaOut(
            emissions_attributable_for_reporting=attributable_for_reporting_total,
            reporting_only_emissions=total_allocated_reporting_only,
            emissions_attributable_for_compliance=total_allocated_for_compliance_2024,
            emissions_limit=emissions_limit_total,
            excess_emissions=excess_emissions,
            credited_emissions=credited_emissions,
            regulatory_values=naics_data,
            products=compliance_product_list,
        )
        print(return_object)

        return return_object
