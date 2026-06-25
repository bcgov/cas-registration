from reporting.enums.enums import ReportingTableNames
from rls.enums import RlsOperations, RlsRoles
from rls.utils.helpers import generate_rls_grants


class Rls:
    role_grants_mapping = {
        RlsRoles.INDUSTRY_USER: [RlsOperations.SELECT],
        RlsRoles.CAS_DIRECTOR: [
            RlsOperations.SELECT,
            RlsOperations.INSERT,
            RlsOperations.UPDATE,
            RlsOperations.DELETE,
        ],
        RlsRoles.CAS_ADMIN: [
            RlsOperations.SELECT,
            RlsOperations.INSERT,
            RlsOperations.UPDATE,
            RlsOperations.DELETE,
        ],
        RlsRoles.CAS_ANALYST: [
            RlsOperations.SELECT,
            RlsOperations.INSERT,
            RlsOperations.UPDATE,
            RlsOperations.DELETE,
        ],
        RlsRoles.CAS_VIEW_ONLY: [
            RlsOperations.SELECT,
        ],
    }
    grants = generate_rls_grants(role_grants_mapping, ReportingTableNames.REPORT_COMMENT)
