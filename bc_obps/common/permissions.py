from typing import Callable, Dict, Literal, Optional, List, Union
from django.core.cache import cache
from django.http import HttpRequest

from common.constants import PERMISSION_CONFIGS_CACHE_KEY
from registration.constants import UNAUTHORIZED_MESSAGE
from ninja.errors import HttpError
from registration.models import AppRole, UserOperator, User


def raise_401_if_user_not_authorized(
    request: HttpRequest,
    authorized_app_roles: List[str],
    authorized_user_operator_roles: Optional[List[str]] = None,
    industry_user_must_be_approved: bool = True,
) -> None:
    """
    Raise a 401 error if a user is not authorized. To be authorized the user must:
        - be logged in (request.current_user exists)
        - have an authorized app_role
        - if the user's app_role is industry_user, then they must additionally have status = 'Approved' in the user_operator table unless industry_user_must_be_approved is set to False (defaults to True)
    """
    if not hasattr(request, 'current_user'):
        raise HttpError(401, UNAUTHORIZED_MESSAGE)
    user: User = request.current_user
    role_name = getattr(user.app_role, "role_name")
    if role_name not in authorized_app_roles:
        raise HttpError(401, UNAUTHORIZED_MESSAGE)

    if user.is_industry_user():
        # We always need to pass authorized_user_operator_roles if the user is an industry user
        if not authorized_user_operator_roles:
            raise HttpError(401, UNAUTHORIZED_MESSAGE)
        if industry_user_must_be_approved:
            approved_user_operator = user.user_operators.filter(status=UserOperator.Statuses.APPROVED).exists()
            if not approved_user_operator:
                raise HttpError(401, UNAUTHORIZED_MESSAGE)
        # If authorized_user_operator_roles is the same as all industry user operator roles, then we can skip the check (Means all industry user roles are authorized)
        if sorted(authorized_user_operator_roles) != sorted(UserOperator.get_all_industry_user_operator_roles()):
            user_operator_role = None
            try:
                user_operator = (
                    UserOperator.objects.exclude(status=UserOperator.Statuses.DECLINED)
                    .only('role')
                    .get(user=user.user_guid)
                )
                user_operator_role = user_operator.role
            except UserOperator.DoesNotExist:
                pass
            if not user_operator_role or user_operator_role not in authorized_user_operator_roles:
                raise HttpError(401, UNAUTHORIZED_MESSAGE)


"""
NOTE: `industry_user_must_be_approved` is an optional parameter that defaults to True in `raise_401_if_user_not_authorized`
and this is the reason why it is not included in some of the permission configurations.
"""


def get_permission_configs(permission: str) -> Optional[Union[Dict[str, List[str]], Dict[str, bool]]]:
    """
    Returns the permission configurations for the specified permission.
    :param permission: The permission to get the configuration for.
    :return: The permission configurations.

    NOTE: We must make this a function so we don't hit database when collecting tests.(we don't have access to DB during collection)
    """
    cached_result: Optional[Dict[str, Dict]] = cache.get(PERMISSION_CONFIGS_CACHE_KEY)
    if cached_result is not None:
        return cached_result.get(permission)

    all_authorized_app_roles = AppRole.get_all_authorized_app_roles()
    all_industry_user_operator_roles = UserOperator.get_all_industry_user_operator_roles()
    permission_configs: Dict[str, Dict] = {
        "all_roles": {
            'authorized_app_roles': AppRole.get_all_app_roles(),
            'authorized_user_operator_roles': all_industry_user_operator_roles,
            'industry_user_must_be_approved': False,
        },
        "authorized_roles": {
            'authorized_app_roles': all_authorized_app_roles,
            'authorized_user_operator_roles': all_industry_user_operator_roles,
            'industry_user_must_be_approved': False,
        },
        "approved_authorized_roles": {
            'authorized_app_roles': all_authorized_app_roles,
            'authorized_user_operator_roles': all_industry_user_operator_roles,
        },
        "authorized_irc_user_and_industry_admin_user": {
            'authorized_app_roles': all_authorized_app_roles,
            'authorized_user_operator_roles': ["admin"],
        },
        "industry_user": {
            'authorized_app_roles': ["industry_user"],
            'authorized_user_operator_roles': all_industry_user_operator_roles,
            'industry_user_must_be_approved': False,
        },
        "approved_industry_user": {
            'authorized_app_roles': ["industry_user"],
            'authorized_user_operator_roles': all_industry_user_operator_roles,
        },
        "approved_industry_admin_user": {
            'authorized_app_roles': ["industry_user"],
            'authorized_user_operator_roles': ["admin"],
        },
        "authorized_irc_user": {
            'authorized_app_roles': AppRole.get_authorized_irc_roles(),
        },
        "cas_director": {
            'authorized_app_roles': list(
                AppRole.objects.filter(role_name="cas_director").values_list("role_name", flat=True)
            ),
        },
    }
    cache.set(PERMISSION_CONFIGS_CACHE_KEY, permission_configs, timeout=3600)  # 1 hour
    return permission_configs.get(permission)


def check_permission_for_role(request: HttpRequest, permission: str) -> bool:
    # This function is separated from check_permission to allow for testing.(e.g. mocking)
    permission_config = get_permission_configs(permission)
    if not permission_config:
        raise ValueError(f"Permission configuration for '{permission}' not found.")
    try:
        raise_401_if_user_not_authorized(request, **permission_config)
        return True
    except Exception:
        return False


def authorize(
    permission: Literal[
        "all_roles",
        "authorized_roles",
        "approved_industry_user",
        "industry_user",
        "approved_industry_admin_user",
        "authorized_irc_user",
        "approved_authorized_roles",
        "authorized_irc_user_and_industry_admin_user",
        "cas_director",
    ]
) -> Callable[[HttpRequest], bool]:
    """
    Returns an authentication function that checks if the user has the specified permission.

    Parameters:
      permission (Permissions): The permission to check.

    Returns:
      Callable[[HttpRequest], bool]: The authentication function.
    """

    def check_permission(
        request: HttpRequest,
    ) -> bool:  # This function must return a boolean to work with django-ninja `auth`.
        return check_permission_for_role(request, permission)

    return check_permission
