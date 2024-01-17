from enum import Enum


class AppRoles(Enum):
    CAS_ADMIN = "cas_admin"
    CAS_ANALYST = "cas_analyst"
    CAS_PENDING = "cas_pending"
    INDUSTRY_USER = "industry_user"  # note: industry users all have the same app_role of "industry_user". Their permissions (admin vs. reporter vs. none) are further defined in the UserOperator table.


class IdPs(Enum):
    IDIR = "idir"
    BCEIDBUSINESS = "bceidbusiness"
