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
    grants = generate_rls_grants(role_grants_mapping, ReportingTableNames.REPORT_VERSION)

    using_statement = """
                report_id IN (
                    SELECT r.id
                    FROM report r
                    JOIN user_operator uo ON uo.operator_id = r.operator_id
                    WHERE uo.user_id IN (select current_setting('my.guid', true))
                    AND uo.status = 'Approved'
                )
                """
    policies = generate_rls_policies(
        roles=RlsRoles,
        operations=RlsOperations,
        table=ReportingTableNames.REPORT_VERSION,
        using_statement=using_statement,
    )
