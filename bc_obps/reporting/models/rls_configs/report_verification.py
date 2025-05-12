from rls.utils.policy import RlsPolicy
from reporting.enums.enums import ReportingTableNames
from rls.enums import RlsRoles, RlsOperations
from rls.utils.helpers import generate_rls_grants, generate_rls_policies


class Rls:
    role_grants_mapping = {
        RlsRoles.INDUSTRY_USER: [
            RlsOperations.SELECT,
            RlsOperations.INSERT,
            RlsOperations.UPDATE,
            RlsOperations.DELETE,
        ],
        RlsRoles.CAS_DIRECTOR: [RlsOperations.SELECT],
        RlsRoles.CAS_ADMIN: [RlsOperations.SELECT],
        RlsRoles.CAS_ANALYST: [RlsOperations.SELECT],
        RlsRoles.CAS_VIEW_ONLY: [RlsOperations.SELECT],
    }
    grants = generate_rls_grants(role_grants_mapping, ReportingTableNames.REPORT_VERIFICATION)

    # policies = generate_rls_policies(
    #     roles=RlsRoles,
    #     operations=RlsOperations,
    #     table=ReportingTableNames.REPORT_VERIFICATION,
    #     using_statement=RlsPolicy.REPORT_USING_STATEMENT,
    # )
