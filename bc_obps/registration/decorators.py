from http import HTTPStatus
from typing import Any, Callable, List
from service.error_service.handle_exception import handle_exception
from ninja.errors import HttpError
from functools import wraps
from registration.utils import raise_401_if_user_not_authorized
from django.http import HttpRequest


def authorize(
    authorized_app_roles: List[str],
    authorized_user_operator_roles: List[str] = [],
    industry_user_must_be_approved: bool = True,
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
                raise_401_if_user_not_authorized(
                    request, authorized_app_roles, authorized_user_operator_roles, industry_user_must_be_approved
                )
            except HttpError as e:
                raise HttpError(HTTPStatus.UNAUTHORIZED, str(e))
            return func(request, *args, **kwargs)

        return wrapper

    return decorator


def handle_http_errors() -> Callable[[Callable[..., Any]], Callable[..., Any]]:
    """
    Decorator to wrap a function in a try-except block and handle exceptions.

    """

    def decorator(func: Callable[..., Any]) -> Callable[..., Any]:
        @wraps(func)
        def wrapper(*args: Any, **kwargs: Any) -> Any:
            try:
                return func(*args, **kwargs)
            except Exception as e:
                return handle_exception(e)

        return wrapper

    return decorator
