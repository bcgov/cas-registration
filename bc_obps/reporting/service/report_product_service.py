from typing import List, Dict
from decimal import Decimal
from uuid import UUID
from django.db.models import Sum

from django.db.models import QuerySet
from django.db import transaction
from reporting.models.emission_category import EmissionCategory
from registration.models.regulated_product import RegulatedProduct
from reporting.models.facility_report import FacilityReport
from reporting.models.report_operation import ReportOperation
from reporting.models.report_product import ReportProduct
from reporting.schema.compliance_data import ReportProductComplianceSchema
from reporting.models.product_emission_intensity import ProductEmissionIntensity
from reporting.models.report_product_emission_allocation import ReportProductEmissionAllocation


class ReportProductService:
    @classmethod
    @transaction.atomic()
    def save_production_data(
        cls, report_version_id: int, facility_id: UUID, report_products: List[dict], user_guid: UUID
    ) -> None:

        facility_report = FacilityReport.objects.get(report_version_id=report_version_id, facility_id=facility_id)

        # Delete the report products that are not in the data

        # A KeyError is raised if the "product_id" key doesn't exist
        product_ids = [rp["product_id"] for rp in report_products]

        # A DoesNotExist error is raised if the report doesn't have a ReportOperation object.
        allowed_product_ids = ReportOperation.objects.get(
            report_version_id=report_version_id
        ).regulated_products.values_list("id", flat=True)

        if RegulatedProduct.objects.filter(id__in=product_ids).exclude(id__in=allowed_product_ids).exists():
            raise ValueError(
                "Data was submitted for a product that is not in the products allowed for this facility. "
                + f"Allowed products ids: {list(allowed_product_ids)}, Submitted product ids: {product_ids}"
            )

        ReportProduct.objects.filter(
            report_version_id=report_version_id, facility_report__facility_id=facility_id
        ).exclude(product_id__in=product_ids).delete()

        # Update or create the report products from the data
        for report_product in report_products:

            product_id = report_product["product_id"]

            report_product_record, _ = ReportProduct.objects.update_or_create(
                report_version_id=report_version_id,
                facility_report=facility_report,
                product_id=product_id,
                defaults={
                    **report_product,
                    "report_version_id": report_version_id,
                    "facility_report": facility_report,
                    "product_id": product_id,
                },
            )
            report_product_record.set_create_or_update(user_guid)

    @classmethod
    def get_production_data(cls, report_version_id: int, facility_id: UUID) -> QuerySet[ReportProduct]:

        return (
            ReportProduct.objects.select_related("product")
            .order_by("product__id")
            .filter(report_version_id=report_version_id, facility_report__facility_id=facility_id)
        )

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
        reporting_only_allocated = ReportProductService.get_allocated_emissions_by_report_product_emission_category(
            report_version_id, product_id, reporting_only_category_ids
        )
        fog_records = ReportProductEmissionAllocation.objects.filter(
            report_version_id=report_version_id,
            report_product__product_id=39,  # Special Fat, Oil & Grease product
        )
        fog_allocated_amount = fog_records.aggregate(allocated_sum=Sum('allocated_quantity'))
        return reporting_only_allocated + (fog_allocated_amount['allocated_sum'] or 0)

    @classmethod
    def get_compliance_production_data(cls, report_version_id: int) -> List[ReportProductComplianceSchema]:
        compliance_product_list: List[ReportProductComplianceSchema] = []
        report_products = (
            ReportProduct.objects.order_by("product_id")
            .filter(report_version_id=report_version_id)
            .distinct('product_id')
        )
        for rp in report_products:
            ei = ProductEmissionIntensity.objects.get(
                product_id=rp.product_id
            ).product_weighted_average_emission_intensity
            industrial_process = ReportProductService.get_allocated_emissions_by_report_product_emission_category(
                report_version_id, rp.product_id, [3]
            )  # ID=3 is Industrial Emissions category
            production_totals = ReportProductService.get_report_product_aggregated_totals(
                report_version_id, rp.product_id
            )
            total_allocated = ReportProductService.get_allocated_emissions_by_report_product_emission_category(
                report_version_id, rp.product_id, list(EmissionCategory.objects.all().values_list('id', flat=True))
            )
            allocated_reporting_only = ReportProductService.get_reporting_only_allocated(
                report_version_id, rp.product_id
            )
            allocated_for_compliance = total_allocated - allocated_reporting_only
            allocated_for_compliance_2024 = (
                allocated_for_compliance / Decimal(production_totals["annual_amount"])
            ) * Decimal(production_totals["apr_dec"])
            print('NAME: ', rp.product.name)
            print('INTENSITY: ', ei)
            print('INDUSTRIAL: ', industrial_process)
            print('PRODUCTION: ', production_totals)
            print('TOTAL ALLOCATED: ', total_allocated)
            print('REPORTING_ONLY: ', allocated_reporting_only)
            print('COMPLIANCE ALLOCATED: ', allocated_for_compliance)
            print('COMP_2024: ', allocated_for_compliance_2024)
            compliance_product_list.append(
                ReportProductComplianceSchema(
                    annual_production=production_totals["annual_amount"],
                    apr_dec_production=production_totals["apr_dec"],
                    emission_intensity=ei,
                    allocated_industrial_process_emissions=industrial_process,
                    allocated_compliance_emissions=allocated_for_compliance_2024,
                )
            )
            print(compliance_product_list)
        return compliance_product_list
