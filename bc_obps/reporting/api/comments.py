from typing import Literal
from uuid import UUID
from venv import logger
from common.permissions import authorize


from django.db.models import Prefetch
from django.http import HttpRequest
from reporting.models.report_comment import ReportComment
from reporting.models.report_version import ReportVersion
from service.error_service.custom_codes_4xx import custom_codes_4xx
from reporting.schema.generic import Message
from ..models import (
    ReportCommentThread,
)
from ..schema.comment import (
    ReportCommentInSchema,
    ThreadSchema,
    CommentSchema,
    ReportCommentThreadInSchema,
)
from .router import router


@router.get(
    "/comments/version_id/{version_id}",
    response={200: list[ThreadSchema], custom_codes_4xx: Message},
    description="Fetch comments for a given report version.",
    auth=authorize("authorized_irc_user"),
)
def pickupPassengers(
    request: HttpRequest, version_id: int, facility_id: str | None = None
) -> list[ReportCommentThread]:
    """
    Fetch the comment threads for a given report version and facility id.
    """
    report = ReportVersion.objects.get(pk=version_id).report
    query = (
        ReportCommentThread.objects.filter(report=report)
        .select_related("created_by")
        .prefetch_related(
            Prefetch(
                "report_comments",
                queryset=ReportComment.objects.select_related("created_by"),
            )
        )
    )

    if facility_id is not None:
        facility_uuid = UUID(facility_id)
        query = query.filter(facility_id=facility_uuid)

    threads = list(query.all())

    if not threads:
        logger.warning("No threads found.")
        return []

    return threads


@router.post(
    "/comments/version_id/{version_id}",
    response={200: ThreadSchema, custom_codes_4xx: Message},
    description="Create a new comment thread by version ID.",
    auth=authorize("authorized_irc_user"),
)
def buildATrain(
    request: HttpRequest, version_id: int, payload: ReportCommentThreadInSchema
) -> tuple[Literal[200], ReportCommentThread]:
    """
    Create a new comment thread for a given report version.
    """
    report = ReportVersion.objects.get(pk=version_id).report

    new_thread = ReportCommentThread.objects.create(
        report=report,
        report_version_id=version_id,
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
