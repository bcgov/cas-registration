from enum import Enum


class AppRoles(Enum):
    CAS_ADMIN = "cas_admin"
    CAS_ANALYST = "cas_analyst"
    CAS_PENDING = "cas_pending"
    INDUSTRY_USER = "industry_user"  # note: UserOperatorRoles below gives finer control over industry_user permissions


class UserOperatorRoles(Enum):
    INDUSTRY_USER_REPORTER = "industry_user_reporter"
    INDUSTRY_USER_ADMIN = "industry_user_admin"


class IdPs(Enum):
    IDIR = "idir"
    BCEIDBUSINESS = "bceidbusiness"
