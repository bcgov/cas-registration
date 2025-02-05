from typing import List
from uuid import UUID
from django.db import transaction
from django.db.models import Sum
from reporting.models.emission_category import EmissionCategory
from registration.models.regulated_product import RegulatedProduct
from reporting.schema.report_product_emission_allocation import (
    ReportFacilityEmissionsSchemaOut,
    ReportProductEmissionAllocationSchemaOut,
    ReportProductEmissionAllocationsSchemaIn,
    ReportProductEmissionAllocationsSchemaOut,
)
from reporting.models.report_product_emission_allocation import ReportProductEmissionAllocation
from reporting.models.report_operation import ReportOperation
from reporting.models.report_product import ReportProduct
from reporting.models import FacilityReport
from reporting.service.emission_category_service import EmissionCategoryService


class ReportEmissionAllocationService:
    @staticmethod
    @transaction.atomic()
    def get_emission_allocation_data(
        report_version_id: int, facility_id: UUID
    ) -> ReportProductEmissionAllocationsSchemaOut:
        # Step 1: Get the facility report ID
        facility_report_id = FacilityReport.objects.get(report_version_id=report_version_id, facility_id=facility_id).pk

        # Step 2: Fetch all emission category totals
        all_emission_categories_totals = ReportEmissionAllocationService.get_emission_category_totals_with_ids(
            facility_report_id
        )

        # Step 3: Fetch report products for the given report version and facility
        report_products = ReportProduct.objects.filter(
            report_version_id=report_version_id, facility_report__facility_id=facility_id
        )

        # Step 4: Fetch existing emission allocations for the given report version and facility
        report_product_emission_allocations = ReportProductEmissionAllocation.objects.filter(
            report_version_id=report_version_id, report_product__facility_report__facility_id=facility_id
        )

        # Step 5: Construct the response data
        existing_allocation = (
            report_product_emission_allocations.first()
        )  # get the first record (if any) to get the allocation_methodology and allocation_other_methodology_description
        allocation_methodology = ""  # because these fields are the same for all records of a report
        allocation_other_methodology_description = ""
        if existing_allocation is not None:
            allocation_methodology = existing_allocation.allocation_methodology
            if existing_allocation.allocation_other_methodology_description is not None:
                allocation_other_methodology_description = existing_allocation.allocation_other_methodology_description

        report_product_emission_allocations_data = []
        total_reportable_emissions = 0
        for category, data in all_emission_categories_totals.items():
            if (
                data["emission_category_type"] == "other_excluded"
            ):  # these categories cannot currently be allocated to products, so we skip them
                continue
            if (
                data["emission_category_type"] == "basic"
            ):  # only these categories are reportable, so we sum them up to get the total reportable emissions
                total_reportable_emissions += data["total_category_allocations"]
            # Build product data
            products = []
            for rp in report_products:
                product_emission = report_product_emission_allocations.filter(
                    report_product_id=rp.id, emission_category__category_name=data["category_name"]
                ).first()
                product = ReportProductEmissionAllocationSchemaOut(
                    report_product_id=rp.pk,
                    product_name=rp.product.name,
                    allocated_quantity=product_emission.allocated_quantity if product_emission else 0,
                )
                products.append(product)

            # Add to the final response
            emissions_total = ReportFacilityEmissionsSchemaOut(
                emission_category_name=data["category_name"],
                emission_category_id=category,
                products=products,
                emission_total=data["total_category_allocations"],
                category_type=data["emission_category_type"],
            )
            report_product_emission_allocations_data.append(emissions_total)

        return ReportProductEmissionAllocationsSchemaOut(
            report_product_emission_allocations=report_product_emission_allocations_data,
            facility_total_emissions=total_reportable_emissions,
            report_product_emission_allocation_totals=ReportEmissionAllocationService.get_emission_totals_by_report_product(
                facility_report_id
            ),
            allocation_methodology=allocation_methodology,
            allocation_other_methodology_description=allocation_other_methodology_description,
        )

    @classmethod
    @transaction.atomic()
    def save_emission_allocation_data(
        cls,
        report_version_id: int,
        facility_id: UUID,
        data: ReportProductEmissionAllocationsSchemaIn,
        user_guid: UUID,
    ) -> None:

        facility_report_id = FacilityReport.objects.get(report_version_id=report_version_id, facility_id=facility_id).pk

        # Assumption: data is only entered when allocated_quantity is not 0
        report_emission_allocations = data.report_product_emission_allocations
        allocation_methodology = data.allocation_methodology
        allocation_other_methodology_description = data.allocation_other_methodology_description

        # Update the emission allocations from the data
        for allocations in report_emission_allocations:
            # emission_total = allocations.emission_total # TODO: validation should be done with this value to make sure we are not under- or over-allocating (currently, this validation occurs in the frontend)
            for product in allocations.products:
                if product.allocated_quantity == 0:  # if the allocated quantity is 0, delete any existing allocation
                    existing_allocation = ReportProductEmissionAllocation.objects.filter(
                        report_version_id=report_version_id,
                        facility_report_id=facility_report_id,
                        report_product_id=product.report_product_id,
                        emission_category_id=allocations.emission_category_id,
                    )
                    if existing_allocation.exists():
                        existing_allocation.delete()
                    continue

                report_emission_allocation_record, _ = ReportProductEmissionAllocation.objects.update_or_create(
                    report_version_id=report_version_id,
                    facility_report_id=facility_report_id,
                    report_product_id=product.report_product_id,
                    emission_category_id=allocations.emission_category_id,
                    defaults={
                        "allocated_quantity": product.allocated_quantity,
                        "allocation_methodology": allocation_methodology,
                        "allocation_other_methodology_description": allocation_other_methodology_description,
                    },
                )

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
        allowed_product_ids = list(
            ReportOperation.objects.get(report_version_id=report_version_id).regulated_products.values_list(
                "id", flat=True
            )
        )

        return not RegulatedProduct.objects.filter(id__in=product_ids).exclude(id__in=allowed_product_ids).exists()

    @staticmethod
    def get_emission_category_totals_with_ids(facility_report_id: int) -> dict:
        """
        Gets the total emissions for each emission category for the given facility report and includes the category type and id.

        Args:
            facility_report_id (int): The ID of the facility report version.

        Returns:
            dict: emission_category_id -> {category_name, total_category_allocations, emission_category_type}
        """
        emission_categories = EmissionCategory.objects.all()
        emission_categories_totals = {}
        for category in emission_categories:
            emission_total = EmissionCategoryService.get_total_emissions_by_emission_category(
                facility_report_id, category.pk
            )
            emission_categories_totals[category.pk] = {
                "category_name": category.category_name,
                "total_category_allocations": emission_total,
                "emission_category_type": category.category_type,
            }

        return emission_categories_totals

    @staticmethod
    def get_emission_totals_by_report_product(
        facility_report_id: int,
    ) -> list[ReportProductEmissionAllocationSchemaOut]:
        """
        Gets the total reportable emissions that have been allocated to each report product for a given facility.
        Excluded emissions are omitted from this total

        Args:
            facility_report_id (int): The ID of the facility report version.

        Returns:
           List[ReportProductEmissionAllocationSchemaOut]
        """
        report_products = ReportProduct.objects.filter(facility_report_id=facility_report_id)
        report_product_emission_allocation_totals = []
        for rp in report_products:
            allocated_quantity = ReportProductEmissionAllocation.objects.filter(
                report_product_id=rp.pk, emission_category__category_type="basic"
            ).aggregate(allocated_quantity=Sum("allocated_quantity"))["allocated_quantity"]
            report_product_emission_allocation_totals.append(
                ReportProductEmissionAllocationSchemaOut(
                    report_product_id=rp.pk,
                    product_name=rp.product.name,
                    allocated_quantity=allocated_quantity if allocated_quantity else 0,
                )
            )
        return report_product_emission_allocation_totals
