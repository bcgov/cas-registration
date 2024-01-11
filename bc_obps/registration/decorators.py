from http import HTTPStatus
from typing import Any, Callable, List
from ninja.errors import HttpError
from functools import wraps
from registration.utils import raise_401_if_user_not_authorized
from django.http import HttpRequest


def authorize(authorized_roles: List[str]) -> Callable[[Callable[..., Any]], Callable[..., Any]]:
    """
    Decorator to authorize a user based on their app_role and UserOperator.role.
    """

    def decorator(func: Callable[..., Any]) -> Callable[..., Any]:
        @wraps(func)
        def wrapper(request: HttpRequest, *args: Any, **kwargs: Any) -> Any:
            try:
                raise_401_if_user_not_authorized(request, authorized_roles)
            except HttpError as e:
                raise HttpError(HTTPStatus.UNAUTHORIZED, str(e))
            return func(request, *args, **kwargs)

        return wrapper

    return decorator
