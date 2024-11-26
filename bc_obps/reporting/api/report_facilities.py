from typing import Literal, Tuple
from common.permissions import authorize
from django.http import HttpRequest
from registration.decorators import handle_http_errors
from reporting.constants import EMISSIONS_REPORT_TAGS
from reporting.schema.generic import Message
from service.error_service.custom_codes_4xx import custom_codes_4xx
from .router import router
from reporting.service.report_facilities_service import ReportFacilitiesService


@router.get(
    "/report-version/{version_id}/facility-list",
    response={200: dict, custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="""Fetches the facility list for the operation associated with the given report version ID.""",
    auth=authorize("approved_industry_user"),
)
@handle_http_errors()
def get_report_facility_list_by_version_id(request: HttpRequest, version_id: int) -> Tuple[Literal[200], dict]:
    response_data = ReportFacilitiesService.get_report_facility_list_by_version_id(version_id)
    return 200, response_data
