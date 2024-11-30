from typing import List
from uuid import UUID
from django.db import transaction
from reporting.models.report_product_emission_allocation import ReportProductEmissionAllocation
from registration.models.regulated_product import RegulatedProduct
from reporting.models.report_operation import ReportOperation
from reporting.models.report_product import ReportProduct


from reporting.models import FacilityReport
from reporting.service.emission_category_service import EmissionCategoryService



class ReportEmissionAllocationService:
    @staticmethod
    @transaction.atomic()
    def get_emission_allocation_data(report_version_id: int, facility_id: UUID) -> dict:
        # Step 1: Get the facility report ID
        facility_report_id = FacilityReport.objects.get(
            report_version_id=report_version_id, facility_id=facility_id
        ).pk
        
        # Step 2: Fetch all emission category totals
        all_emmission_categories_totals = EmissionCategoryService.get_all_category_totals(facility_report_id)
        
        # Step 3: Fetch report products for the given report version and facility
        report_products = ReportProduct.objects.filter(
            report_version_id=report_version_id, facility_report__facility_id=facility_id
        )
        
        # Step 4: Fetch existing emission allocations for the given report version and facility
        report_product_emission_allocations = ReportProductEmissionAllocation.objects.filter(
            report_version_id=report_version_id, report_product__facility_report__facility_id=facility_id
        )
        
        # Step 5: Construct the response data
        report_product_emission_allocations_data = []
        for category, total in all_emmission_categories_totals.items():
            if category in ["lfo_excluded", "attributable_for_reporting", "attributable_for_threshold", "reporting_only"]:
                continue  # Skip special categories
            
            # Build product data
            products = []
            for rp in report_products:
                product_emission = report_product_emission_allocations.filter(
                    report_product=rp, emission_category__category_name=category
                ).first()
                products.append(
                    {
                        "product_id": rp.product_id,
                        "product_name": rp.product.name,
                        "product_emission": product_emission.allocated_quantity if product_emission else 0,
                    }
                )
            
            # Add to the final response data
            report_product_emission_allocations_data.append(
                {
                    "emission_category": category,
                    "products": products,
                    "emission_total": total,
                }
            )
        
        return {
            "report_product_emission_allocations": report_product_emission_allocations_data,
            "facility_total_emissions": all_emmission_categories_totals["attributable_for_reporting"],
        }

    @classmethod
    @transaction.atomic()
    def save_emission_allocation_data(
        cls, report_version_id: int, facility_id: UUID, report_emission_allocations: List[dict], user_guid: UUID
    ) -> None:
        # incoming [{report_product_id: int, emission_category_id: int, allocated_quantity: Decimal}]
        # report_product_id or just product_id??

        # Delete previous allocations that are no longer in the data

        # WIP**: this section assumes that the product_id and NOT the report_product_id is being passed in the data
        # gets the report_product_ids that match the product_ids in the data and report version and facility
        # deletes all allocations where the report_product_id is not in the list of report_product_ids_from_data
        # Assumption: data is only entered when allocated_quantity is not 0

        product_ids_from_data = [rea["product_id"] for rea in report_emission_allocations]
        report_product_ids_from_data = ReportProduct.objects.filter(
            report_version_id=report_version_id,
            facility_report__facility_id=facility_id,
            product_id__in=product_ids_from_data,
        ).values_list("id", flat=True)

        ReportProductEmissionAllocation.objects.filter(report_version_id=report_version_id).exclude(
            report_product_id__in=report_product_ids_from_data
        ).delete()

        # Update or create the emission allocations from the data
        for allocation in report_emission_allocations:
            report_product_id = ReportProduct.objects.get(
                report_version_id=report_version_id,
                facility_report__facility_id=facility_id,
                product_id=allocation["product_id"],
            ).id
            emission_category_id = allocation["emission_category_id"]
            allocated_quantity = allocation["allocated_quantity"]

            report_emission_allocation_record, _ = ReportProductEmissionAllocation.objects.update_or_create(
                report_version_id=report_version_id,
                report_product_id=report_product_id,
                emission_category_id=emission_category_id,
                defaults={
                    **allocation,
                    "report_product_id": report_product_id,
                    "emission_category_id": emission_category_id,
                    "allocated_quantity": allocated_quantity,
                },
            )
            report_emission_allocation_record.set_create_or_update(user_guid)

    @staticmethod
    def check_if_products_are_allowed(report_version_id: int, product_ids: List[int]) -> bool:
        """
        Check if the given product IDs are allowed for the given report version ID.

        Args:
            report_version_id (int): The ID of the report version.
            product_ids (List[int]): A list of product IDs.

        Returns:
            bool: True if all product IDs are allowed, False otherwise.
        """
        allowed_product_ids = ReportOperation.objects.get(
            report_version_id=report_version_id
        ).regulated_products.values_list("id", flat=True)

        return not RegulatedProduct.objects.filter(id__in=product_ids).exclude(id__in=allowed_product_ids).exists()
