from uuid import UUID
from venv import logger
from common.permissions import authorize


from django.db.models import Subquery
from django.http import HttpRequest
from reporting.models.report_comment_bodyofthesnake import ReportCommentBodyOfTheSnake
from reporting.models.report_version import ReportVersion
from service.error_service.custom_codes_4xx import custom_codes_4xx
from reporting.schema.generic import Message
from ..models import (
    ReportCommentHeadHonchoOfTheCongaLineBoii,
)
from ..schema.comment import BodyOfTheSnakeInSchema, CommentSchema, ReportCommentHeadHonchoInSchema
from .router import router


@router.get(
    "/comments/version_id/{version_id}",
    response={200: list[CommentSchema], custom_codes_4xx: Message},
    description="Fetch comments for a given report version.",
    auth=authorize("authorized_irc_user"),
)
def pickupPassengers(
    request: HttpRequest, version_id: int, facility_id: str | None = None
) -> list[ReportCommentHeadHonchoOfTheCongaLineBoii]:
    """
    Fetch the comment threads for a given report version and facility id.
    """
    report_id = ReportVersion.objects.filter(pk=version_id).values("report_id")[:1]
    query = ReportCommentHeadHonchoOfTheCongaLineBoii.objects.filter(
        report_version__report_id=Subquery(report_id)
    ).prefetch_related("report_comments_bodyofthesnake")

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
    response={200: int, custom_codes_4xx: Message},
    description="Create a new comment thread by version ID.",
    auth=authorize("authorized_irc_user"),
)
def buildATrain(request: HttpRequest, version_id: int, payload: ReportCommentHeadHonchoInSchema) -> dict:
    """
    Create a new comment thread for a given report version.
    """
    report_version = ReportVersion.objects.filter(pk=version_id).first()
    if not report_version:
        return {"error": "Report version not found."}

    new_thread = ReportCommentHeadHonchoOfTheCongaLineBoii.objects.create(
        report_version=report_version,
        report_section=payload.report_section,
        title=payload.title,
        is_resolved=False,
        is_visible_to_industry=payload.is_visible_to_industry,
    )

    return 200, new_thread.id


@router.post(
    "/comment/version_id/{version_id}/thread_id/{thread_id}",
    response={200: int, custom_codes_4xx: Message},
    description="Add a new comment to an existing thread.",
    auth=authorize("authorized_irc_user"),
)
def addToCommentThread(request: HttpRequest, version_id: int, thread_id: int, payload: BodyOfTheSnakeInSchema) -> dict:
    """
    Update an existing comment thread for a given report version and thread ID.
    """

    comment = ReportCommentBodyOfTheSnake.objects.create(
        report_comment_headhonchoofthecongalineboii_id=thread_id,
        report_version_id=version_id,
        comment=payload.comment,
    )

    return 200, comment.id
