from typing import List, Literal, Tuple
from uuid import UUID
from django.http import HttpRequest
from django.db.models import QuerySet
from registration.decorators import handle_http_errors
from reporting.constants import EMISSIONS_REPORT_TAGS
from reporting.models.report_product import ReportProduct
from reporting.schema.report_product import ReportProductIn
from service.error_service import custom_codes_4xx
from reporting.schema.generic import Message
from .router import router


@router.post(
    "report-version/{report_version_id}/facilities/{facility_id}/production-data",
    response={200: int, custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="""Saves the data for the production data page into multiple ReportProduct rows""",
    # auth=authorize("approved_industry_user"),
)
@handle_http_errors()
def save_production_data(
    request: HttpRequest,
    report_version_id: int,
    facility_id: UUID,
    payload: List[ReportProductIn],
) -> Literal[200]:

    print("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~")
    print(payload)

    return 200


@router.get(
    "report-version/{report_version_id}/facilities/{facility_id}/production-data",
    response={200: int, custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="""Retrieves the data for the production data page from the multiple ReportProduct rows""",
    # auth=authorize("approved_industry_user"),
)
def load_production_data(
    request: HttpRequest, report_version_id: int, facility_id: UUID
) -> Tuple[Literal[200], QuerySet[ReportProduct]]:

    return 200, ReportProduct.objects.filter(facility_report__facility_id=facility_id).all()
