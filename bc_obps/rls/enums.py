from enum import Enum


class RlsRoles(Enum):
    INDUSTRY_USER = "industry_user"
    CAS_DIRECTOR = "cas_director"
    CAS_ADMIN = "cas_admin"
    CAS_ANALYST = "cas_analyst"
    CAS_PENDING = "cas_pending"
    CAS_VIEW_ONLY = "cas_view_only"
    ALL_ROLES = "industry_user, cas_director, cas_admin, cas_analyst, cas_pending, cas_view_only"



class RlsOperations(Enum):
    SELECT = "SELECT"
    UPDATE = "UPDATE"
    INSERT = "INSERT"
    DELETE = "DELETE"
