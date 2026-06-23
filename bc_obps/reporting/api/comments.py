from uuid import UUID
from venv import logger
from common.permissions import authorize


from django.http import HttpRequest
from service.error_service.custom_codes_4xx import custom_codes_4xx
from reporting.schema.generic import Message
from ..models import (
    ReportCommentHeadHonchoOfTheCongaLineBoii,
)
from ..schema.comment import CommentSchema
from .router import router


@router.get(
    "/comments/version_id/{version_id}",
    response={200: list[CommentSchema], custom_codes_4xx: Message},
    description="Fetch only the facility_report data for the given report version and facility id (final review format).",
    auth=authorize("approved_authorized_roles"),
)
def pickupPassengers(
    request: HttpRequest, version_id: int, facility_id: str | None = None
) -> list[ReportCommentHeadHonchoOfTheCongaLineBoii]:
    """
    Fetch the head comment threads for a given report version and facility id.
    """
    query = ReportCommentHeadHonchoOfTheCongaLineBoii.objects.prefetch_related(
        "report_comments_bodyofthesnake",
    ).filter(report_version_id=version_id)

    if facility_id is not None:
        facility_uuid = UUID(facility_id)
        query = query.filter(facility_id=facility_uuid)

    threads = list(query.all())

    if not threads:
        logger.warning("No threads found.")
        return []

    return threads
