import logging
from typing import Callable, Optional
from django.db import connection
from django.conf import settings
from django.http import HttpRequest, HttpResponse
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
                raise RuntimeError("CurrentUserMiddleware must be placed before RlsMiddleware in MIDDLEWARE settings.")

    def __call__(self, request: HttpRequest) -> HttpResponse:
        user: Optional[User] = getattr(request, 'current_user', None)
        # Note from Dylan for later:
        # when we get to actually setting roles, we'll want to still set a role here. We might need an "Unauthenticated" role to set in this case.
        if user:
            self._set_user_context(user)
        else:
            logger.info("Anonymous user detected, skipping user context setup", exc_info=True)
        return self.get_response(request)

    @staticmethod
    def _set_user_context(user: User) -> None:
        try:
            with connection.cursor() as cursor:
                cursor.execute('set my.guid = %s', [str(user.user_guid)])
                # set the role based on the user's app role
                cursor.execute('set role %s', [user.app_role.role_name])
        except Exception as e:
            logger.error(f"Failed to set user context: {e}", exc_info=True)
