from django.http import HttpRequest
from ninja import Status
from reporting.constants import EMISSIONS_REPORT_TAGS
from reporting.schema.generic import Message
from service.error_service.custom_codes_4xx import custom_codes_4xx
from .router import router
from reporting.service.report_facilities_service import ReportFacilitiesService
from reporting.api.permissions import approved_industry_user_report_version_composite_auth


@router.get(
    "/report-version/{version_id}/facility-list",
    response={200: dict, custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="""Fetches the facility list for the operation associated with the given report version ID.""",
    auth=approved_industry_user_report_version_composite_auth,
)
def get_report_facility_list_by_version_id(request: HttpRequest, version_id: int) -> Status:
    response_data = ReportFacilitiesService.get_report_facility_list_by_version_id(version_id)
    return Status(200, response_data)
