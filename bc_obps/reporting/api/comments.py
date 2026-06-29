from typing import List, Literal
from uuid import UUID
import logging
from .router import router

from common.api.utils.current_user_utils import get_current_user_guid
from common.permissions import authorize
from ..schema.comment import (
    ReportCommentInSchema,
    ReportCommentResolveSchema,
    ThreadSchema,
    CommentSchema,
    ReportCommentThreadInSchema,
    ThreadSchemaOut,
)
from ..models import (
    ReportCommentThread,
)

from django.db.models import Prefetch
from django.http import HttpRequest
from registration.models.facility import Facility
from reporting.models.report_comment import ReportComment
from reporting.models.report_version import ReportVersion
from service.error_service.custom_codes_4xx import custom_codes_4xx
from reporting.schema.generic import Message

logger = logging.getLogger(__name__)


@router.get(
    "/comments/version_id/{version_id}",
    response={200: ThreadSchemaOut, custom_codes_4xx: Message},
    description="Fetch comments for a given report version.",
    auth=authorize("authorized_irc_user"),
)
def pickupPassengers(
    request: HttpRequest, version_id: int, facility_id: str | None = None
) -> dict[List[ReportCommentThread], UUID]:
    """
    Fetch the comment threads for a given report version and facility id.
    """
    user_guid = get_current_user_guid(request)
    report = ReportVersion.objects.get(pk=version_id).report
    query = (
        ReportCommentThread.objects.filter(report=report)
        .select_related("created_by")
        .prefetch_related(
            Prefetch(
                "report_comments",
                queryset=ReportComment.objects.select_related("created_by"),
            ),
            Prefetch("facility", queryset=Facility.objects.only("id", "name")),
        )
    )

    if facility_id is not None:
        facility_uuid = UUID(facility_id)
        query = query.filter(facility_id=facility_uuid)

    threads = list(query.all())

    if not threads:
        logger.warning("No threads found.")
        return {"threads": [], user_guid: UUID(int=0)}

    return {"threads": threads, "user_guid": user_guid}


@router.post(
    "/comments/version_id/{version_id}",
    response={200: ThreadSchema, custom_codes_4xx: Message},
    description="Create a new comment thread by version ID.",
    auth=authorize("authorized_irc_user"),
)
def buildATrain(
    request: HttpRequest, version_id: int, payload: ReportCommentThreadInSchema, facility_id: str | None = None
) -> tuple[Literal[200], ReportCommentThread]:
    """
    Create a new comment thread for a given report version.
    """
    report = ReportVersion.objects.get(pk=version_id).report
    facility_uuid = None
    if facility_id is not None:
        facility_uuid = UUID(facility_id)

    new_thread = ReportCommentThread.objects.create(
        report=report,
        report_version_id=version_id,
        facility_id=facility_uuid,
        report_section=payload.report_section,
        title=payload.title,
        is_resolved=False,
        is_visible_to_industry=payload.is_visible_to_industry,
    )

    return 200, new_thread


@router.post(
    "/comment/version_id/{version_id}/thread_id/{thread_id}",
    response={200: CommentSchema, custom_codes_4xx: Message},
    description="Add a new comment to an existing thread.",
    auth=authorize("authorized_irc_user"),
)
def addToCommentThread(
    request: HttpRequest, version_id: int, thread_id: int, payload: ReportCommentInSchema
) -> tuple[Literal[200], ReportComment]:
    """
    Update an existing comment thread for a given report version and thread ID.
    """

    comment = ReportComment.objects.create(
        report_comment_thread_id=thread_id,
        report_version_id=version_id,
        comment=payload.comment,
    )

    return 200, comment


@router.patch(
    "/comment/resolve/thread_id/{thread_id}",
    response={200: ReportCommentResolveSchema, custom_codes_4xx: Message},
    description="Resolve a thread.",
    auth=authorize("authorized_irc_user"),
)
def checkTicket(request: HttpRequest, thread_id: int) -> Literal[200]:
    """
    Resolve an existing comment thread for a given thread ID.
    """

    thread = ReportCommentThread.objects.get(pk=thread_id)
    thread.is_resolved = True
    thread.save()

    return 200
