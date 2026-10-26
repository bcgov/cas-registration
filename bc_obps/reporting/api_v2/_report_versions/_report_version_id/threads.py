from typing import Literal, Tuple
from common.api.utils.current_user_utils import get_current_user
from reporting.service.comment_thread_service import CommentThreadService
from common.permissions import authorize
from django.db import transaction
from django.http import HttpRequest

from reporting.api_v2._report_versions._report_version_id.comment_thread_schema import (
    CommentThreadIn,
    CommentThreadSchema,
    CommentThreadsOut,
)
from reporting.api_v2.response_builder import ResponseBuilder
from reporting.api_v2.router import router
from reporting.api_v2.schema import ReportingResponseSchema
from reporting.constants import EMISSIONS_REPORT_TAGS, REPORT_COMMENTS_TAGS
from reporting.models.comment_thread import CommentThread
from reporting.models.report_version import ReportVersion
from reporting.schema.generic import Message
from reporting.service.report_facilities_service import ReportFacilitiesService
from service.error_service.custom_codes_4xx import custom_codes_4xx


@router.get(
    "report-version/{version_id}/threads",
    response={200: ReportingResponseSchema[CommentThreadsOut]},
    tags=[],
    description="Retrieves all the comment threads for a specific report, accessed by the provided report version.",
    auth=authorize("authorized_irc_user"),
)
def get_comment_threads(request: HttpRequest, version_id: str) -> Tuple[Literal[200], dict]:
    user = get_current_user(request)
    report_id = ReportVersion.objects.get(id=version_id).report_id

    threads = CommentThreadService.get_threads(report_id=report_id, user_guid=user.guid)

    facilities_dict = ReportFacilitiesService.get_all_facilities_for_review(int(version_id))

    facilities = [
        {"facility_id": facility["facility_id"], "facility_name": facility["facility__name"]}
        for facility in [*facilities_dict["current_facilities"], *facilities_dict["past_facilities"]]
    ]
    can_create_comment_thread = user.is_cas_analyst() or user.is_cas_director()

    response = (
        ResponseBuilder()
        .payload({"threads": threads, "facilities": facilities, "can_create_comment_thread": can_create_comment_thread})
        .build()
    )
    return 200, response


@router.post(
    "report-version/{version_id}/threads",
    response={201: CommentThreadSchema, custom_codes_4xx: Message},
    tags=[*EMISSIONS_REPORT_TAGS, *REPORT_COMMENTS_TAGS],
    description="Creates a new comment thread for a specific report version, with an optional facility associated.",
    auth=authorize("cas_director_analyst"),
)
@transaction.atomic
def create_thread(
    request: HttpRequest, version_id: str, payload: CommentThreadIn
) -> Tuple[Literal[201], CommentThread]:
    thread = CommentThreadService.create_thread(
        version_id=int(version_id),
        comment=payload.comment,
        facility_id=payload.facility_id,
    )

    return 201, thread
