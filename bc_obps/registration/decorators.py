from http import HTTPStatus
from typing import Any, Callable, List
from ninja.errors import HttpError
from functools import wraps
from registration.utils import raise_401_if_app_role_not_authorized
from django.http import HttpRequest


def authorize(
    authorized_app_roles: List[str], authorized_user_operator_roles: List[str] = []
) -> Callable[[Callable[..., Any]], Callable[..., Any]]:
    """
    Decorator to authorize a user based on their app_role and UserOperator.role.

    Args:

        - authorized_app_roles: A list of the app roles that are allowed access.
        - authorized_user_operator_roles: A list of the UserOperator.role that are allowed access. If this argument is not provided, no UserOperator.role will be allowed access and therefore no one with an 'industry_user' app_role will be allowed access. (This is to prevent accidentally giving access if we forget that the industry_user has additional permissions in UserOperator.)
    """

    def decorator(func: Callable[..., Any]) -> Callable[..., Any]:
        @wraps(func)
        def wrapper(request: HttpRequest, *args: Any, **kwargs: Any) -> Any:
            try:
                raise_401_if_app_role_not_authorized(request, authorized_app_roles)
            except HttpError as e:
                raise HttpError(HTTPStatus.UNAUTHORIZED, str(e))
            return func(request, *args, **kwargs)

        return wrapper

    return decorator
