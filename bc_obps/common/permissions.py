from typing import Callable, Dict, Literal
from django.http import HttpRequest
from registration.utils import raise_401_if_user_not_authorized
from registration.models import AppRole, UserOperator

"""
NOTE: `industry_user_must_be_approved` is an optional parameter that defaults to True in `raise_401_if_user_not_authorized`
and this is the reason why it is not included in some of the permission configurations.
"""

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
}


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
        permission_config = permission_configs.get(permission)
        if not permission_config:
            raise ValueError(f"Permission configuration for '{permission}' not found.")
        try:
            raise_401_if_user_not_authorized(request, **permission_config)
            return True
        except Exception:
            return False

    return check_permission
