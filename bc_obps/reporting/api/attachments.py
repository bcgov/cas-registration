from typing import Any, Literal
from common.permissions import authorize
from django.http import HttpRequest
from registration.decorators import handle_http_errors
from reporting.constants import EMISSIONS_REPORT_TAGS
from reporting.schema.generic import Message
from reporting.schema.report_attachments import ReportAttachmentsIn
from service.error_service import custom_codes_4xx
from .router import router


@router.post(
    "report-version/{report_version_id}/attachments",
    response={200: int, custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="""Saves the reporting attachments, passed as text in the payload.""",
    auth=authorize("approved_industry_user"),
)
@handle_http_errors()
def save_report_attachments(request: HttpRequest, report_version_id: int, payload: ReportAttachmentsIn) -> Literal[200]:
    print("~~~~~~~~~~~~~~~~~~~~~~~~~~~~")
    print(payload)

    return 200
