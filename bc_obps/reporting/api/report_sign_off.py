from reporting.schema.report_sign_off import ReportSignOffOut
from reporting.service.report_sign_off_service import ReportSignOffService
from common.permissions import authorize
from reporting.constants import EMISSIONS_REPORT_TAGS
from service.error_service.custom_codes_4xx import custom_codes_4xx
from django.http import HttpRequest
from reporting.schema.generic import Message
from .router import router


@router.get(
    "/report-version/{report_version_id}/sign-off",
    response={200: ReportSignOffOut, custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="""Fetches any existing sign-off data associated with the given report version ID.""",
    auth=authorize("approved_industry_user"),
)
def get_report_sign_off(request: HttpRequest, report_version_id: int) -> tuple[int, ReportSignOffOut]:
    response_data = ReportSignOffService.get_report_sign_off(report_version_id)
    return 200, response_data
