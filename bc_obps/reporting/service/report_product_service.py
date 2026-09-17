from typing import List
from uuid import UUID

from django.db.models import QuerySet
from django.db import transaction
from registration.models.regulated_product import RegulatedProduct
from reporting.models.facility_report import FacilityReport
from reporting.models.report_operation import ReportOperation
from reporting.models.report_product import ReportProduct


class ReportProductService:

    @classmethod
    def update_empty_records_for_unregulated_products(
        cls,
        report_version_id: int,
        facility_report_id: int,
    ) -> None:
        """
        Adds a "zero" report_product record for unregulated products reported by this operation (for emission allocation purposes only)
        """

        reported_unregulated_products = (
            ReportOperation.objects.get(report_version_id=report_version_id)
            .regulated_products.filter(is_regulated=False)
            .exclude(
                id__in=ReportProduct.objects.filter(
                    report_version_id=report_version_id,
                    facility_report_id=facility_report_id,
                ).values_list("product_id", flat=True)
            )
            .values_list("id", flat=True)
        )

        for product_id in reported_unregulated_products:
            ReportProduct.objects.update_or_create(
                report_version_id=report_version_id,
                facility_report_id=facility_report_id,
                product_id=product_id,
                defaults={
                    "report_version_id": report_version_id,
                    "facility_report_id": facility_report_id,
                    "product_id": product_id,
                    "annual_production": 0,
                    "production_data_jan_mar": 0,
                    "production_data_apr_dec": 0,
                    "production_methodology": "other",
                    "production_methodology_description": "auto-generated report_product record for unregulated product",
                },
            )

    @classmethod
    @transaction.atomic()
    def save_production_data(
        cls, report_version_id: int, facility_id: UUID, report_products: List[dict], user_guid: UUID
    ) -> None:

        facility_report = FacilityReport.objects.get(report_version_id=report_version_id, facility_id=facility_id)

        # A DoesNotExist error is raised if the report doesn't have a ReportOperation object.
        allowed_products = ReportOperation.objects.get(report_version_id=report_version_id).regulated_products
        allowed_product_ids = allowed_products.values_list("id", flat=True)

        # A KeyError is raised if the "product_id" key doesn't exist
        submitted_product_ids = {rp["product_id"] for rp in report_products}

        if RegulatedProduct.objects.filter(id__in=submitted_product_ids).exclude(id__in=allowed_product_ids).exists():
            raise ValueError(
                "Data was submitted for a product that is not in the products allowed for this facility. "
                + f"Allowed products ids: {list(allowed_product_ids)}, Submitted product ids: {submitted_product_ids}"
            )

        # Do not remove auto-generated report_product records for unregulated products
        keep = submitted_product_ids.union(allowed_products.filter(is_regulated=False).values_list("id", flat=True))
        ReportProduct.objects.filter(
            report_version_id=report_version_id, facility_report__facility_id=facility_id
        ).exclude(product_id__in=keep).delete()

        # Update or create the report products from the data
        for report_product in report_products:
            product_id = report_product["product_id"]

            ReportProduct.objects.update_or_create(
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

        ReportProductService.update_empty_records_for_unregulated_products(report_version_id, facility_report.id)

    @classmethod
    def get_production_data(cls, report_version_id: int, facility_id: UUID) -> QuerySet[ReportProduct]:

        return (
            ReportProduct.objects.select_related("product")
            .order_by("product__id")
            .filter(report_version_id=report_version_id, facility_report__facility_id=facility_id)
        )

    @classmethod
    def get_allowed_products(cls, report_version_id: int) -> QuerySet[RegulatedProduct]:
        return ReportOperation.objects.get(report_version_id=report_version_id).regulated_products.exclude(
            is_regulated=False
        )
