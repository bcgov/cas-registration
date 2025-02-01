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

    @classmethod
    def get_production_data(cls, report_version_id: int, facility_id: UUID) -> QuerySet[ReportProduct]:

        return (
            ReportProduct.objects.select_related("product")
            .order_by("product__id")
            .filter(report_version_id=report_version_id, facility_report__facility_id=facility_id)
        )
