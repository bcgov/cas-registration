from typing import Literal, Tuple

from django.http import HttpRequest

from reporting.api_v2._reports._report_id.comment_schema import CommentThreadIn, CommentThreadSchema, CommentThreadsOut
from reporting.api_v2.response_builder import ResponseBuilder
from reporting.api_v2.router import router
from reporting.api_v2.schema import ReportingResponseSchema
from reporting.constants import EMISSIONS_REPORT_TAGS, REPORT_COMMENTS_TAGS
from reporting.models.comment import Comment
from reporting.models.comment_thread import CommentThread
from reporting.models.report_version import ReportVersion
from reporting.schema.generic import Message
from service.error_service.custom_codes_4xx import custom_codes_4xx


@router.get(
    "report-version/{version_id}/threads",
    response={200: ReportingResponseSchema[CommentThreadsOut]},
    tags=[],
    description="Retrieves all the comment threads for a specific report, accessed by the provided report version.",
    auth="authorized_irc_user",
)
def get_comment_threads(request: HttpRequest, version_id: str) -> Tuple[Literal[200], dict]:
    report = ReportVersion.objects.get(id=version_id).report
    threads = report.comment_threads.all()
    facility_id = request.facility_id if getattr(request, "facility_id", None) else None
    if facility_id:
        threads = threads.filter(facility_id=facility_id)

    response = ResponseBuilder().payload(CommentThreadsOut(threads=list(threads))).build()
    return 200, response


@router.post(
    "report-version/{version_id}/threads",
    response={201: CommentThreadSchema, custom_codes_4xx: Message},
    tags=[*EMISSIONS_REPORT_TAGS, *REPORT_COMMENTS_TAGS],
)
def create_thread(
    request: HttpRequest, version_id: str, payload: CommentThreadIn
) -> Tuple[Literal[201], CommentThread]:
    report_id = ReportVersion.objects.get(id=version_id).report_id
    thread = CommentThread.objects.create(
        report_id=report_id,
        report_version_id=version_id,
        facility_id=payload.facility_id,
    )
    Comment.objects.create(
        comment_thread=thread,
        report_version_id=version_id,
        comment=payload.comment,
    )

    return 201, thread
