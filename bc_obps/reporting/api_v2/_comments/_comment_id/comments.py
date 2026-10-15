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
from reporting.schema.report_validation_data import ValidationErrorsSchemaOut
from service.error_service.custom_codes_4xx import custom_codes_4xx
from service.error_service.handle_exception import ExceptionHandler


class CommentPermissionErrorOut(ValidationErrorsSchemaOut):
    message: str


@router.delete(
    "comments/{comment_id}",
    response={
        200: int,
        custom_codes_4xx - frozenset({403}): Message,
        403: CommentPermissionErrorOut,
    },
    tags=[*EMISSIONS_REPORT_TAGS, *REPORT_COMMENTS_TAGS],
    description="Deletes a comment authored by the current user and removes its thread if empty.",
    auth=authorize("cas_director_analyst"),
)
@transaction.atomic
def delete_comment(request: HttpRequest, comment_id: str) -> Status:
    user_guid: UUID = get_current_user_guid(request)
    comment = Comment.objects.get(id=comment_id)
    if comment.created_by_id != user_guid:
        return Status(
            403,
            ExceptionHandler.build_error_response_body(
                "You do not have permission to delete this comment.",
                key="permission_denied",
            ),
        )
    thread = comment.comment_thread
    comment.delete()
    thread.refresh_from_db()
    if not thread.comments.exists():
        thread.delete()
    return Status(200, 200)
