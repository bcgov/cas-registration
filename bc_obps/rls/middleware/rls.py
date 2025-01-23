import logging
from typing import Callable, Optional
from uuid import UUID
from django.db import connection
from django.http import HttpRequest, HttpResponse
from bc_obps import settings
from registration.models import User

logger = logging.getLogger(__name__)

class RlsMiddleware:
    """
    Middleware to set the user context for Row Level Security (RLS) in PostgreSQL.
    NOTE: We need to use this middleware after CurrentUserMiddleware to be able to access the current_user attribute
    """
    def __init__(self, get_response: Callable[[HttpRequest], HttpResponse]):
        self.get_response = get_response

        # Check middleware order during initialization
        current_user_middleware = "registration.middleware.current_user.CurrentUserMiddleware"
        if current_user_middleware in settings.MIDDLEWARE:
            rls_index = settings.MIDDLEWARE.index("rls.middleware.rls.RlsMiddleware")
            current_user_index = settings.MIDDLEWARE.index(current_user_middleware)
            if current_user_index > rls_index:
                raise RuntimeError(
                    "CurrentUserMiddleware must be placed before RlsMiddleware in MIDDLEWARE settings."
                )

    def __call__(self, request: HttpRequest) -> HttpResponse:
        user: Optional[User] = getattr(request, 'current_user', None)
        if user:
            self._set_user_context(user.user_guid)
        else:
            logger.info("Anonymous user detected, skipping user context setup", exc_info=True)
        return self.get_response(request)

    @staticmethod
    def _set_user_context(user_guid: UUID) -> None:
        try:
            with connection.cursor() as cursor:
                cursor.execute('set my.guid = %s', [str(user_guid)])
        except Exception as e:
            logger.error(f"Failed to set user context: {e}", exc_info=True)