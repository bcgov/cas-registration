from typing import List
from uuid import UUID

from django.db.models import QuerySet

from reporting.models.facility_report import FacilityReport
from reporting.models.report_product import ReportProduct
from reporting.schema.report_product import ReportProductSchemaIn


class ReportProductService:
    @classmethod
    def save_production_data(
        cls, report_version_id: int, facility_id: UUID, report_products: List[ReportProductSchemaIn]
    ) -> None:
        facility_report = FacilityReport.objects.get(report_version_id=report_version_id, facility_id=facility_id)

        # Delete the report products that are not in the data
        product_ids = map(lambda x: x.product_id, report_products)
        ReportProduct.objects.filter(
            report_version_id=report_version_id, facility_report__facility_id=facility_id
        ).exclude(product_id__in=product_ids).delete()

        # Update or create the report products from the data
        for report_product in report_products:

            ReportProduct.objects.update_or_create(
                report_version_id=report_version_id,
                facility_report=facility_report,
                product_id=report_product.product_id,
                defaults={
                    **report_product.dict(),
                    "report_version_id": report_version_id,
                    "facility_report": facility_report,
                    "product_id": report_product.product_id,
                    "unit": "tonnes",
                },
            )

    @classmethod
    def get_production_data(cls, report_version_id: int, facility_id: UUID) -> QuerySet[ReportProduct]:

        return ReportProduct.objects.select_related("product").filter(
            report_version_id=report_version_id, facility_report__facility_id=facility_id
        )
