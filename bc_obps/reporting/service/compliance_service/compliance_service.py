from reporting.models.report_emission import ReportEmission
from reporting.models.report_product import ReportProduct
from reporting.models import ReportVersion
from reporting.models.product_emission_intensity import ProductEmissionIntensity
from reporting.models.emission_category import EmissionCategory
from reporting.service.compliance_service.emission_allocation import (
    get_emissions_from_only_funny_category_13,
    get_fog_emissions,
    get_reporting_only_allocated,
)
from reporting.service.compliance_service.industrial_process import (
    compute_industrial_process_emissions,
    get_allocated_emissions_by_report_product_emission_category,
)
from reporting.service.compliance_service.parameters import ComplianceParameters
from reporting.models import ReportComplianceSummary, ReportComplianceSummaryProduct
from registration.models import RegulatedProduct
from decimal import Decimal
from django.db.models import Sum
from typing import Dict, List
from django.db import transaction
from dataclasses import dataclass

from reporting.service.compliance_service.regulatory_values import (
    RegulatoryValues,
    get_industry_regulatory_values,
    get_product_regulatory_values_override,
)


@dataclass
class ReportProductComplianceData:
    name: str
    product_id: int
    annual_production: Decimal
    apr_dec_production: Decimal
    emission_intensity: Decimal
    allocated_industrial_process_emissions: Decimal
    allocated_compliance_emissions: Decimal
    reduction_factor_override: Decimal | None
    tightening_rate_override: Decimal | None

    def as_record_defaults(self) -> dict[str, Decimal | None]:
        return {
            "annual_production": ComplianceParameters.round(self.annual_production),
            "apr_dec_production": ComplianceParameters.round(self.apr_dec_production),
            "emission_intensity": ComplianceParameters.round(self.emission_intensity),
            "allocated_industrial_process_emissions": ComplianceParameters.round(
                self.allocated_industrial_process_emissions
            ),
            "allocated_compliance_emissions": ComplianceParameters.round(self.allocated_compliance_emissions),
            "reduction_factor_override": (
                ComplianceParameters.round(self.reduction_factor_override) if self.reduction_factor_override else None
            ),
            "tightening_rate_override": (
                ComplianceParameters.round(self.tightening_rate_override) if self.tightening_rate_override else None
            ),
        }


@dataclass
class ComplianceData:
    emissions_attributable_for_reporting: Decimal
    reporting_only_emissions: Decimal
    emissions_attributable_for_compliance: Decimal
    emissions_limit: Decimal
    excess_emissions: Decimal
    credited_emissions: Decimal
    industry_regulatory_values: RegulatoryValues
    products: List[ReportProductComplianceData]
    reporting_year: int

    def as_record_defaults(self) -> dict[str, Decimal | int]:
        return {
            "emissions_attributable_for_reporting": ComplianceParameters.round(
                self.emissions_attributable_for_reporting
            ),
            "reporting_only_emissions": ComplianceParameters.round(self.reporting_only_emissions),
            "emissions_attributable_for_compliance": ComplianceParameters.round(
                self.emissions_attributable_for_compliance
            ),
            "emissions_limit": ComplianceParameters.round(self.emissions_limit),
            "excess_emissions": ComplianceParameters.round(self.excess_emissions),
            "credited_emissions": ComplianceParameters.round(self.credited_emissions),
            "initial_compliance_period": self.industry_regulatory_values.compliance_period,
            "compliance_period": self.industry_regulatory_values.compliance_period,
            "reduction_factor": ComplianceParameters.round(self.industry_regulatory_values.reduction_factor),
            "tightening_rate": ComplianceParameters.round(self.industry_regulatory_values.tightening_rate),
        }


class ComplianceService:
    """
    Service that fetches the data & performs the calculations necessary for the compliance summary
    """

    @staticmethod
    def get_emissions_attributable_for_reporting(report_version_id: int) -> Decimal:
        records = ReportEmission.objects_with_decimal_emissions.filter(
            report_version_id=report_version_id,
            emission_categories__category_type="basic",
        )
        attributable_sum = records.aggregate(emission_sum=Sum("emission"))

        return attributable_sum["emission_sum"] or Decimal("0")

    @staticmethod
    def get_production_totals(report_version_id: int) -> Dict[str, Decimal]:
        records = ReportProduct.objects.filter(
            report_version_id=report_version_id,
        )
        annual_production_sum = records.aggregate(production_sum=Sum("annual_production"))
        apr_dec_sum = records.aggregate(production_sum=Sum("production_data_apr_dec"))

        return {
            "annual_amount": annual_production_sum["production_sum"] or Decimal("0"),
            "apr_dec": apr_dec_sum["production_sum"] or Decimal("0"),
        }

    @staticmethod
    def get_report_product_aggregated_totals(report_version_id: int, product_id: int) -> Dict[str, Decimal]:
        records = ReportProduct.objects.filter(
            report_version_id=report_version_id,
            product_id=product_id,
        )
        product_annual_amount_sum = records.aggregate(production_sum=Sum("annual_production"))
        apr_dec_sum = records.aggregate(production_sum=Sum("production_data_apr_dec"))

        return {
            "annual_amount": product_annual_amount_sum["production_sum"] or Decimal("0"),
            "apr_dec": apr_dec_sum["production_sum"] or Decimal("0"),
        }

    @staticmethod
    def calculate_product_emission_limit(
        pwaei: Decimal,
        production_for_emission_limit: Decimal,
        allocated_industrial_process: Decimal,
        allocated_for_compliance: Decimal,
        tightening_rate: Decimal,
        reduction_factor: Decimal,
        compliance_period: int,
        initial_compliance_period: int = 2024,
    ) -> Decimal:

        # Handle divide by 0 error if allocated_for_compliance is 0
        industrial_process_compliance_allocated_division = Decimal("0")
        if allocated_for_compliance > 0:
            industrial_process_compliance_allocated_division = allocated_industrial_process / allocated_for_compliance

        product_emission_limit = (production_for_emission_limit * pwaei) * (
            reduction_factor
            - (
                (Decimal("1") - (industrial_process_compliance_allocated_division))
                * tightening_rate
                * (compliance_period - initial_compliance_period)
            )
        )
        return product_emission_limit

    @staticmethod
    def get_calculated_compliance_data(report_version_id: int) -> ComplianceData:
        # Fetch the ReportVersion once (bring in reporting_year and operation) to avoid extra queries
        report_version_record = ReportVersion.objects.select_related("report__reporting_year", "report_operation").get(
            pk=report_version_id
        )

        # Get regulatory values (periods are global, but RF/TR will be applied per product)
        industry_regulatory_values = get_industry_regulatory_values(report_version_record)
        registration_purpose = report_version_record.report_operation.registration_purpose

        ##### Don't use schemas, use classes or dicts
        compliance_product_list: List[ReportProductComplianceData] = []
        total_allocated_reporting_only = Decimal(0)
        total_allocated_for_compliance_default = Decimal(0)
        total_allocated_for_compliance_2024 = Decimal(0)
        emissions_limit_total = Decimal(0)

        # Determine whether this report's compliance calculations should use the Apr-Dec (2024) window
        # Use the report's reporting year (from the ReportVersion) rather than the NAICS regulatory value.
        use_apr_dec = report_version_record.report.reporting_year_id == 2024

        report_products = (
            ReportProduct.objects.order_by("product_id")
            .filter(report_version_id=report_version_id, product__is_regulated=True)
            .distinct("product_id")
        )
        # Iterate on all products reported (by product ID)
        for rp in report_products:
            product_regulatory_values_override = get_product_regulatory_values_override(
                report_version_record, rp.product_id
            )
            ei = ProductEmissionIntensity.objects.get(
                product_id=rp.product_id
                # TEMPORAL CHECKS
            ).product_weighted_average_emission_intensity

            industrial_process = compute_industrial_process_emissions(rp)

            production_totals = ComplianceService.get_report_product_aggregated_totals(report_version_id, rp.product_id)
            allocated = get_allocated_emissions_by_report_product_emission_category(
                report_version_id,
                rp.product_id,
                list(EmissionCategory.objects.filter(category_type="basic").values_list("id", flat=True)),
            )
            allocated_reporting_only = get_reporting_only_allocated(report_version_id, rp.product_id)
            allocated_for_compliance = allocated - allocated_reporting_only
            # If this compliance period is 2024, use Apr-Dec production for allocations and limits.
            # Otherwise use full-year production and full-year allocated emissions.
            production_for_limit, allocated_for_compliance_2024, allocated_compliance_emissions_value = (
                ComplianceParameters.resolve_compliance_parameters(
                    use_apr_dec, allocated_for_compliance, production_totals
                )
            )

            # Compute emissions limit with the product-specific regulatory values,
            # Defaulting to industry regulatory values otherwise
            product_emission_limit = ComplianceService.calculate_product_emission_limit(
                pwaei=ei,
                production_for_emission_limit=production_for_limit,
                allocated_industrial_process=Decimal(industrial_process),
                allocated_for_compliance=Decimal(allocated_for_compliance),
                tightening_rate=(
                    product_regulatory_values_override.tightening_rate_override
                    or industry_regulatory_values.tightening_rate
                ),
                reduction_factor=(
                    product_regulatory_values_override.reduction_factor_override
                    or industry_regulatory_values.reduction_factor
                ),
                compliance_period=industry_regulatory_values.compliance_period,
            )

            # Add individual product amounts to totals
            total_allocated_reporting_only += allocated_reporting_only
            # Accumulate into the default (full-year) allocated total
            total_allocated_for_compliance_default += allocated_for_compliance
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
                    allocated_compliance_emissions=Decimal(allocated_compliance_emissions_value),
                    reduction_factor_override=product_regulatory_values_override.reduction_factor_override,
                    tightening_rate_override=product_regulatory_values_override.tightening_rate_override,
                )
            )

        # Emissions allocated to funny category and no other than basic
        total_allocated_to_only_category_13 = get_emissions_from_only_funny_category_13(report_version_id)
        total_allocated_reporting_only += total_allocated_to_only_category_13

        # Fog emissions must also be allocated to an unregulated product
        total_allocated_to_fog = get_fog_emissions(report_version_id)
        total_allocated_reporting_only += total_allocated_to_fog

        # Get attributable emission total
        attributable_for_reporting_total = ComplianceService.get_emissions_attributable_for_reporting(report_version_id)
        # Calculate used allocated total and excess/credited emissions.
        # For New Entrant Operations, zero out compliance comparisons (they have no compliance obligations).
        if registration_purpose == "New Entrant Operation":
            total_allocated_for_compliance_used = Decimal(0)
            emissions_limit_total = Decimal(0)
            excess_emissions = Decimal(0)
            credited_emissions = Decimal(0)
        else:
            # Select which allocated total to use for compliance comparisons: Apr-Dec 2024 window or default full-year total
            total_allocated_for_compliance_used = (
                total_allocated_for_compliance_2024 if use_apr_dec else total_allocated_for_compliance_default
            )
            if total_allocated_for_compliance_used > emissions_limit_total:
                excess_emissions = total_allocated_for_compliance_used - emissions_limit_total
                credited_emissions = Decimal(0)
            else:
                excess_emissions = Decimal(0)
                credited_emissions = emissions_limit_total - total_allocated_for_compliance_used

        # Craft return object with all data
        return_object = ComplianceData(
            emissions_attributable_for_reporting=attributable_for_reporting_total,
            reporting_only_emissions=ComplianceParameters.round(total_allocated_reporting_only),
            emissions_attributable_for_compliance=ComplianceParameters.round(total_allocated_for_compliance_used),
            emissions_limit=ComplianceParameters.round(emissions_limit_total),
            excess_emissions=ComplianceParameters.round(excess_emissions),
            credited_emissions=ComplianceParameters.round(credited_emissions),
            industry_regulatory_values=industry_regulatory_values,
            products=compliance_product_list,
            reporting_year=report_version_record.report.reporting_year_id,
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
            defaults=compliance_data_to_save.as_record_defaults(),
        )
        for product_data_to_save in compliance_data_to_save.products:
            product_data_id = None
            if ReportComplianceSummaryProduct.objects.filter(
                report_version_id=report_version_id,
                product_id=product_data_to_save.product_id,
            ):
                product_data_id = ReportComplianceSummaryProduct.objects.get(
                    report_version_id=report_version_id,
                    product_id=product_data_to_save.product_id,
                ).id
            ReportComplianceSummaryProduct.objects.update_or_create(
                id=product_data_id,
                report_version=report_version_record,
                report_compliance_summary=compliance_summary_record,
                product=RegulatedProduct.objects.get(id=product_data_to_save.product_id),
                defaults=product_data_to_save.as_record_defaults(),
            )
