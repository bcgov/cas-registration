from typing import List
from uuid import UUID
from django.db import transaction
from reporting.models.report_product_emission_allocation import ReportProductEmissionAllocation
from registration.models.regulated_product import RegulatedProduct
from reporting.models.facility_report import FacilityReport
from reporting.models.report_operation import ReportOperation
from reporting.models.report_product import ReportProduct


class ReportEmissionAllocationService:
    @classmethod
    @transaction.atomic()
    def save_emission_allocation_data(
        cls, report_version_id: int, facility_id: UUID, report_emission_allocations: List[dict], user_guid: UUID
    ) -> None:
        # incoming [{report_product_id: int, emission_category_id: int, allocated_quantity: Decimal}]
        # report_product_id or just product_id??

        # Delete previous allocations that are no longer in the data

        # if just product_id
        facility_report = FacilityReport.objects.get(report_version_id=report_version_id, facility_id=facility_id)

        product_ids = [rea["product_id"] for rea in report_emission_allocations]
        report_products = cls.get_report_products_from_product_ids(report_version_id, facility_id, product_ids)

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
