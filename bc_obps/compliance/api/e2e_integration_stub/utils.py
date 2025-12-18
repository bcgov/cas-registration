import json
from typing import Any, Dict, Optional
from uuid import UUID
from django.conf import settings
from django.http import HttpRequest
from requests.models import Response


def json_response(status: int, payload: Any, url: str) -> Response:
    """Create a mocked HTTP response with JSON content.

    Used by HTTP mocking to simulate external API responses.
    """
    r = Response()
    r.status_code = status
    r._content = json.dumps(payload).encode("utf-8")
    r.headers["Content-Type"] = "application/json"
    r.url = url
    return r


def base_url(setting_name: str) -> str:
    """Get base URL from settings, handling None and trailing slashes."""
    return str(getattr(settings, setting_name, "") or "").rstrip("/")


def is_external_url(url: str, base: str) -> bool:
    """Check if URL is an external API call to a configured base URL."""
    return bool(base) and url.startswith(base)


def is_local_url(url: str) -> bool:
    """Check if URL is localhost/127.0.0.1 (allowed through HTTP mocking)."""
    return url.startswith("http://localhost") or url.startswith("http://127.0.0.1")


def extract_user_guid_from_authorization_header(request: HttpRequest) -> Optional[UUID]:
    auth_header = request.headers.get("Authorization") or request.META.get("HTTP_AUTHORIZATION")
    if not auth_header:
        return None

    try:
        auth_obj = json.loads(auth_header)
    except json.JSONDecodeError:
        return None

    user_guid_raw = auth_obj.get("user_guid")
    if not user_guid_raw:
        return None

    try:
        return UUID(str(user_guid_raw))
    except ValueError:
        return None


def extract_user_guid(request: HttpRequest, payload: Dict[str, Any]) -> UUID:
    # Try middleware-provided current_user first
    try:
        current_user = getattr(request, "current_user", None)
        user_guid = getattr(current_user, "user_guid", None)
        if user_guid:
            return UUID(str(user_guid))
    except (ValueError, TypeError):
        pass

    # Try payload.user_guid
    user_guid_raw = payload.get("user_guid")
    if user_guid_raw:
        return UUID(str(user_guid_raw))

    # Try Authorization header JSON
    guid_from_auth = extract_user_guid_from_authorization_header(request)
    if guid_from_auth:
        return guid_from_auth

    raise ValueError(
        "user_guid could not be resolved. Expected request.current_user.user_guid, "
        "payload.user_guid, or Authorization header."
    )
