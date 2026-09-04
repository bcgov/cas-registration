from typing import Literal, Tuple

from django.http import HttpRequest

from reporting.api_v2._reports._report_id.comment_schema import CommentThreadsOut
from reporting.api_v2.response_builder import ResponseBuilder
from reporting.api_v2.router import router
from reporting.api_v2.schema import ReportingResponseSchema
from reporting.models.report_version import ReportVersion


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
