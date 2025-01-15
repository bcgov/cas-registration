from typing import Literal
from uuid import UUID
from bc_obps.reporting.service.report_facilities_service import ReportFacilitiesService
from reporting.constants import EMISSIONS_REPORT_TAGS
from common.api.utils.current_user_utils import get_current_user_guid
from common.permissions import authorize
from registration.decorators import handle_http_errors
from service.error_service.custom_codes_4xx import custom_codes_4xx
from django.http import HttpRequest
from reporting.schema.generic import Message
from .router import router

@router.get(
    "report-version/{report_version_id}/selected-facilities",
    response={200: list[UUID], custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="""Retrieves the list of selected facilities for a report version""",
    exclude_none=True,
    auyh=authorize("approved_industry_user"),
)
@handle_http_errors()
def get_selected_facilities(
    request: HttpRequest, report_version_id: int
) -> tuple[Literal[200], list[UUID]]:
    response_data = ReportFacilitiesService.get_selected_facilities(report_version_id)
    return 200, response_data

@router.post(
    "report-version/{report_version_id}/selected-facilities",
    response={200: int, custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="""Saves the list of selected facilities for a report version""",
    auth=authorize("approved_industry_user"),
)
@handle_http_errors()
def save_selected_facilities(
    request: HttpRequest,
    report_version_id: int,
    payload: list[UUID],
) -> Literal[200]:
    ReportFacilitiesService.save_selected_facilities(
        report_version_id,
        payload,
        get_current_user_guid(request),
    )

    return 200
