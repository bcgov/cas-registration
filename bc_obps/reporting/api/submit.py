from uuid import UUID
from common.api.utils.current_user_utils import get_current_user_guid
from common.permissions import authorize
from django.http import HttpRequest
from registration.decorators import handle_http_errors
from reporting.constants import EMISSIONS_REPORT_TAGS
from reporting.schema.generic import Message
from service.report_submission_service import ReportSubmissionService

from .router import router


@router.post(
    "report-version/{version_id}/submit",
    response={200: int, 400: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="""Submits a report version""",
    auth=authorize("approved_authorized_roles"),
)
@handle_http_errors()
def submit_report_version(request: HttpRequest, version_id: int) -> int:
    user_guid: UUID = get_current_user_guid(request)
    ReportSubmissionService.submit_report(version_id, user_guid)
    return version_id
