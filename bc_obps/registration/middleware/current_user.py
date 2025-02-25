import json
import logging
from typing import Callable, Optional
from uuid import UUID
from django.core.cache import cache
from django.http import JsonResponse, HttpRequest, HttpResponse
from registration.constants import USER_CACHE_PREFIX
from registration.models import User

logger = logging.getLogger(__name__)


class CurrentUserMiddleware:
    def __init__(self, get_response: Callable[[HttpRequest], HttpResponse]):
        self.get_response = get_response

    def __call__(self, request: HttpRequest) -> HttpResponse:
        auth_header = request.headers.get("Authorization")
        if auth_header:
            try:
                user_guid = self._extract_user_guid(auth_header)
                user = self.get_or_cache_user(user_guid)
                setattr(request, "current_user", user)
            except ValueError as e:
                logger.warning(f"Invalid Authorization header: {e}", exc_info=True)
                return JsonResponse({"error": "Invalid Authorization header"}, status=400)
            except Exception as e:
                logger.error(f"Unexpected error in CurrentUserMiddleware: {e}", exc_info=True)

        return self.get_response(request)

    @staticmethod
    def _extract_user_guid(auth_header: str) -> UUID:
        """
        Extracts and validates the user GUID from the Authorization header.
        """
        try:
            user_data = json.loads(auth_header)
            user_guid = user_data.get("user_guid")
            if not user_guid:
                raise ValueError("Missing user_guid in Authorization header")
            return UUID(user_guid, version=4)
        except (KeyError, ValueError, TypeError) as e:
            raise ValueError(f"Failed to extract user GUID: {e}")

    @staticmethod
    def get_or_cache_user(user_guid: UUID) -> Optional[User]:
        """
        Retrieves the full user object from the cache or database.
        """
        cache_key = f"{USER_CACHE_PREFIX}{user_guid}"
        user: Optional[User] = cache.get(cache_key)

        if not user:
            try:
                user = User.objects.get(user_guid=user_guid)
                cache.set(cache_key, user, 300)  # Cache for 5 minutes
            except User.DoesNotExist:
                pass  # Gracefully handle the case where the user does not exist
        return user
