from enum import Enum

class Roles(Enum):
    CAS_ADMIN = "cas_admin"
    CAS_ANALYST = "cas_analyst"
    CAS_PENDING = "cas_pending"
    INDUSTRY_USER = "industry_user"
    INDUSTRY_USER_ADMIN = "industry_user_admin"

class IdPs(Enum):
    IDIR = "idir"
    BCEIDBUSINESS = "bceidbusiness"
