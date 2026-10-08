from uuid import UUID

from common.api.utils.current_user_utils import get_current_user_guid
from common.permissions import authorize
from django.db import transaction
from django.http import HttpRequest

from ninja import Status
from reporting.api_v2.router import router
from reporting.constants import EMISSIONS_REPORT_TAGS, REPORT_COMMENTS_TAGS
from reporting.models.comment import Comment
from reporting.schema.generic import Message
from service.error_service.custom_codes_4xx import custom_codes_4xx


@router.delete(
    "comments/{comment_id}",
    response={200: int, custom_codes_4xx: Message},
    tags=[*EMISSIONS_REPORT_TAGS, *REPORT_COMMENTS_TAGS],
    description="Deletes a comment authored by the current user and removes its thread if empty.",
    auth=authorize("authorized_irc_user"),
)
@transaction.atomic
def delete_comment(request: HttpRequest, comment_id: str) -> Status:
    user_guid: UUID = get_current_user_guid(request)
    comment = Comment.objects.get(id=comment_id)
    if comment.created_by_id == user_guid:
        return Status(403, {"message": "You do not have permission to delete this comment."})
    thread = comment.comment_thread
    comment.delete()
    thread.refresh_from_db()
    if not thread.comments.exists():
        thread.delete()
    return Status(200, 200)
