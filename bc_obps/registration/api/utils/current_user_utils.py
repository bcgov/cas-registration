from uuid import UUID
from django.http import HttpRequest
from registration.models import User


def get_current_user(request: HttpRequest) -> User:
    return request.current_user


def get_current_user_guid(request: HttpRequest) -> UUID:
    return request.current_user.user_guid
