from .user import user, user_profile, user_app_role
from . import (
    e2e_test_setup,
    naics_codes,
    operation,
    operator,
    user_operator,
    business_structure,
    regulated_products,
    reporting_activities,
)

from .user_operator import (
    operator,
    is_approved_admin_user_operator,
    operator_access_declined,
    operator_from_user,
    operator_has_admin,
    user_operator_from_user,
    user_operator_id,
    user_operator_id_from_user,
    user_operator_initial_requests,
    user_operator_list_from_user,
)
from .select_operator import request_access, request_admin_access
from .user_operator import update_status
from .api_base import router  # django_ninja router object
