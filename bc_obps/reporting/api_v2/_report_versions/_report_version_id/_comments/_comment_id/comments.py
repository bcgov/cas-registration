from uuid import UUID
from reporting.service.comment_service import CommentService
from common.api.utils.current_user_utils import get_current_user_guid
from common.permissions import authorize
from django.db import transaction
from django.http import HttpRequest

from reporting.api_v2.router import router
from reporting.constants import EMISSIONS_REPORT_TAGS, REPORT_COMMENTS_TAGS
from reporting.schema.generic import Message
from service.error_service.custom_codes_4xx import custom_codes_4xx


@router.delete(
    "report-version/{version_id}/comments/{comment_id}",
    response={200: int, custom_codes_4xx: Message},
    tags=[*EMISSIONS_REPORT_TAGS, *REPORT_COMMENTS_TAGS],
    description="Deletes a comment authored by the current user and removes its thread if empty.",
    auth=authorize("cas_director_analyst"),
)
@transaction.atomic
def delete_comment(request: HttpRequest, version_id: str, comment_id: str) -> int:
    user_guid: UUID = get_current_user_guid(request)
    CommentService.delete_comment(comment_id=comment_id, user_guid=user_guid)
    return 200
