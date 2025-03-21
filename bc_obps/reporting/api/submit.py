from uuid import UUID
from reporting.schema.report_sign_off import ReportSignOffIn
from common.api.utils.current_user_utils import get_current_user_guid
from common.permissions import authorize
from django.http import HttpRequest
from reporting.api.permissions import check_version_ownership_in_url
from reporting.constants import EMISSIONS_REPORT_TAGS
from reporting.schema.generic import Message
from reporting.service.report_submission_service import ReportSubmissionService
from service.error_service.custom_codes_4xx import custom_codes_4xx
from .router import router


@router.post(
    "report-version/{version_id}/submit",
    response={200: int, custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="""Submits a report version""",
    auth=authorize("approved_industry_user", check_version_ownership_in_url("version_id")),
)
def submit_report_version(request: HttpRequest, version_id: int, payload: ReportSignOffIn) -> int:
    user_guid: UUID = get_current_user_guid(request)
    ReportSubmissionService.submit_report(version_id, user_guid, payload)
    return version_id
