from typing import Literal, Tuple
from django.http import HttpRequest

from common.permissions import authorize
from registration.decorators import handle_http_errors
from reporting.schema.generic import Message
from service.error_service.custom_codes_4xx import custom_codes_4xx
from service.report_service import ReportService
from .router import router
from ..models import ReportNewEntrantProduction, ReportNewEntrant, ReportNewEntrantEmissions, EmissionCategory
from ..schema.report_new_entrant import ReportNewEntrantSchemaIn
from ..service.emission_category_service import EmissionCategoryService
from ..service.report_new_entrant_service import ReportNewEntrantService


@router.get(
    "report-version/{report_version_id}/new-entrant-data",
    response={200: dict},
    tags=["Emissions Report"],
    description="Takes version_id (primary key of Report_Version model) and returns all new entrant data for that report version.",
    # auth=authorize("approved_industry_user"),
)
def get_new_entrant_data(request: HttpRequest, report_version_id: int) -> Tuple[Literal[200], dict]:
    try:
        # Retrieve new entrant data based on report_version_id
        emissions = list(
            ReportNewEntrantEmissions.objects.filter(
                report_new_entrant__report_version=report_version_id
            )
            .select_related("emission_category", "report_new_entrant")
            .order_by("emission_category_id")
            .values("id", "emission_category_id", "report_new_entrant__id", "emission","emission_category__category_name", "emission_category__category_type")
        )
        regulated_products = ReportService.get_regulated_products_by_version_id(version_id=report_version_id) or {}
        emission_category = EmissionCategory.objects.all().values()
        selected_products = list(
            ReportNewEntrantProduction.objects.filter(
                report_new_entrant__report_version=report_version_id
            )
            .select_related("product", "report_new_entrant")
            .order_by("product_id")
            .values("id", "product__name", "report_new_entrant__id", "production_amount", "product_id")
        )

        report_new_entrant = (
            ReportNewEntrant.objects.filter(report_version=report_version_id)
            .values()
            .first()
        )

        response_data = {
            "regulated_products": regulated_products,
            "emissions": emissions,
            "emission_category": list(emission_category),
            "selected_products": selected_products,
            "report_new_entrant": dict(report_new_entrant),

        }

        return 200, response_data

    except Exception as e:
        # Log or print the error for debugging
        print(f"An error occurred while retrieving new entrant data: {e}")


@router.post(
    "report-version/{report_version_id}/new-entrant-data",
    response={200: int, custom_codes_4xx: Message},
    tags=["Emissions Report"],
    description="Saves the data for the new entrant report",
    auth=authorize("approved_industry_user"),
)
@handle_http_errors()
def save_new_entrant_data(
        request: HttpRequest,
        report_version_id: int,
        payload: ReportNewEntrantSchemaIn,
) -> Literal[200]:
    ReportNewEntrantService.save_new_entrant_data(report_version_id, payload)

    return 200
