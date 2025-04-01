import json
from typing import Literal, Tuple
from django.http import HttpRequest
from registration.constants import USER_TAGS
from service.data_access_service.user_service import UserDataAccessService
from registration.schema import Message
from registration.api.router import router
from service.error_service.custom_codes_4xx import custom_codes_4xx
import logging
from django.http import JsonResponse

logger = logging.getLogger(__name__)


@router.get(
    "/user/user-is-archived",
    response={200: bool, custom_codes_4xx: Message},
    tags=USER_TAGS,
    description="""Checks if user is archived and returns boolean.""",
)
def check_is_user_archived(request: HttpRequest) -> JsonResponse | Tuple[Literal[200], bool]:
    # we can't use request.current_user if the user is archived

    auth_header = request.headers.get("Authorization")
    if auth_header:
        try:
            user_data = json.loads(auth_header)
            user_guid = user_data.get("user_guid")
        except ValueError as e:
            logger.warning(f"Invalid Authorization header: {e}", exc_info=True)
            return JsonResponse({"error": "Invalid Authorization header"}, status=400)
    return 200, bool(UserDataAccessService.get_by_guid(user_guid=user_guid, include_archived=True).archived_at)
