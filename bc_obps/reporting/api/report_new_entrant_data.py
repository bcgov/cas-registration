from typing import Literal, Tuple

from django.http import HttpRequest

from common.permissions import authorize
from registration.decorators import handle_http_errors
from reporting.schema.generic import Message
from service.error_service.custom_codes_4xx import custom_codes_4xx
from service.report_service import ReportService
from .router import router
from ..models import ReportNewEntrantProduction, ReportNewEntrant, ReportNewEntrantEmissions, EmissionCategory
from ..schema.report_new_entrant import ReportNewEntrantDataOut, ReportNewEntrantSchemaIn
from ..service.report_new_entrant_service import ReportNewEntrantService


@router.get(
    "report-version/{report_version_id}/new-entrant-data",
    response={200: ReportNewEntrantDataOut, custom_codes_4xx: Message},
    description="""Retrieves the data for the new entrant data page, including selected products and emissions.""",
    exclude_none=True,
)
@handle_http_errors()
def get_new_entrant_data(request: HttpRequest, report_version_id: int) -> Tuple[Literal[200], dict]:
    # Fetch new entrant report details
    report_new_entrant = ReportNewEntrant.objects.filter(report_version=report_version_id).first()

    # Fetch selected products
    selected_products = ReportNewEntrantProduction.objects.filter(
        report_new_entrant__report_version=report_version_id
    ).select_related("product", "report_new_entrant")

    # Fetch allowed products
    regulated_products = ReportService.get_regulated_products_by_version_id(version_id=report_version_id) or {}

    # Fetch emissions
    emissions = ReportNewEntrantEmissions.objects.filter(
        report_new_entrant__report_version=report_version_id
    ).select_related("emission_category")

    # Fetch emission categories
    emission_categories = EmissionCategory.objects.all()

    return 200, {
        "report_new_entrant": report_new_entrant,
        "selected_products": selected_products,
        "allowed_products": regulated_products,
        "emissions": emissions,
        "emission_category": emission_categories,
    }


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
