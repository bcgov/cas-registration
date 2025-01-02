from django.db import connection
from uuid import UUID
import json


class RlsMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        auth_header = request.headers.get('Authorization')
        if auth_header:
            user_guid = self._extract_user_guid(auth_header)
            self._set_user_context(user_guid)

        return self.get_response(request)

    @staticmethod
    def _extract_user_guid(auth_header: str) -> UUID:
        try:
            user_guid = UUID(json.loads(auth_header).get('user_guid'), version=4)
        except (ValueError, TypeError, json.JSONDecodeError):
            raise ValueError("Invalid Authorization header format")
        return user_guid

    @staticmethod
    def _set_user_context(user_guid: UUID) -> None:
        with connection.cursor() as cursor:
            cursor.execute('SET my.guid = %s', [str(user_guid)])
            cursor.execute("SELECT app_role_id FROM erc.user")
            role = cursor.fetchone()
            if role:
                cursor.execute('SET role %s', [role[0]])
            else:
                raise RuntimeError("Failed to fetch user role")
