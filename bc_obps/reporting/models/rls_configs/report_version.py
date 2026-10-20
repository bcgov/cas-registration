from reporting.enums.enums import ReportingTableNames
from rls.enums import RlsRoles, RlsOperations
from rls.utils.helpers import generate_rls_grants


class Rls:
    # role_grants_mapping = {
    #     RlsRoles.INDUSTRY_USER: [
    #         RlsOperations.SELECT,
    #         RlsOperations.INSERT,
    #         RlsOperations.UPDATE,
    #         RlsOperations.DELETE,
    #     ],
    #     RlsRoles.CAS_DIRECTOR: [RlsOperations.SELECT],
    #     RlsRoles.CAS_ADMIN: [RlsOperations.SELECT],
    #     RlsRoles.CAS_ANALYST: [RlsOperations.SELECT],
    #     RlsRoles.CAS_VIEW_ONLY: [RlsOperations.SELECT],
    # }
    # grants = generate_rls_grants(role_grants_mapping, ReportingTableNames.REPORT_VERSION)

    grants_mapping_with_column_restrictions = {
            RlsRoles.INDUSTRY_USER: [
                'select(id, report_id)',
                RlsOperations.INSERT,
                RlsOperations.UPDATE,
                RlsOperations.DELETE,
            ],
            RlsRoles.CAS_DIRECTOR: [RlsOperations.SELECT],
            RlsRoles.CAS_ADMIN: [RlsOperations.SELECT],
            RlsRoles.CAS_ANALYST: [RlsOperations.SELECT],
            RlsRoles.CAS_VIEW_ONLY: [RlsOperations.SELECT],
        }
    
    grants = generate_rls_grants(grants_mapping_with_column_restrictions, ReportingTableNames.REPORT_VERSION)