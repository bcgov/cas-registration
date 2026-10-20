from reporting.enums.enums import ReportingTableNames
from rls.enums import RlsRoles, RlsOperations
from typing import Dict, List
from rls.utils.grant import ColumnGrant, Grant
from rls.utils.helpers import generate_rls_grants


class Rls:
    role_grants_mapping: Dict[RlsRoles, List[Grant]] = {
        RlsRoles.INDUSTRY_USER: [
            ColumnGrant(RlsOperations.SELECT, ["id", "report_id"]),
            RlsOperations.INSERT,
            RlsOperations.UPDATE,
            RlsOperations.DELETE,
        ],
        RlsRoles.CAS_DIRECTOR: [RlsOperations.SELECT],
        RlsRoles.CAS_ADMIN: [RlsOperations.SELECT],
        RlsRoles.CAS_ANALYST: [RlsOperations.SELECT],
        RlsRoles.CAS_VIEW_ONLY: [RlsOperations.SELECT],
    }
    grants = generate_rls_grants(role_grants_mapping, ReportingTableNames.REPORT_VERSION)
