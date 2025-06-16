from rls.utils.policy import RlsPolicy
from reporting.enums.enums import ReportingTableNames
from rls.enums import RlsRoles, RlsOperations
from rls.utils.helpers import generate_report_policy_mapping_from_grants, generate_rls_grants, generate_rls_policies


class Rls:
    enable_rls = True
    schema = 'erc'
    table = ReportingTableNames.REPORT_ACTIVITY
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
    grants = generate_rls_grants(role_grants_mapping, table)
    role_policy_mapping = generate_report_policy_mapping_from_grants(
        role_grants_mapping,
        RlsPolicy.REPORT_USING_STATEMENT,
        RlsPolicy.REPORT_DELETE_USING_STATEMENT,
    )
    policies = generate_rls_policies(
        role_policy_mapping,
        table
    )
