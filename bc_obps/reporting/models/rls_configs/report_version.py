import re
from common.enums import Schemas
from rls.utils.policy import RlsPolicy
from reporting.enums.enums import ReportingTableNames
from rls.enums import RlsRoles, RlsOperations
from rls.utils.helpers import generate_report_policy_mapping_from_grants, generate_rls_grants, generate_rls_policies


class Rls:
    enable_rls = True
    schema = 'erc'
    table = ReportingTableNames.REPORT_VERSION
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

    using_statement = """
        report_id IN (
            SELECT r.id
            FROM erc.report r
            WHERE r.operator_id IN (
                SELECT uo.operator_id
                FROM erc.user_operator uo
                WHERE uo.user_id = current_setting('my.guid', true)::uuid
                AND uo.status = 'Approved'
            )
        )"""
    delete_using_statement = re.sub(
        r"(AND uo\.status = 'Approved'\s*\)\s*\))",
        r"\1 AND status = 'Draft'",
        using_statement,
        count=1,
    )
    role_policy_mapping = generate_report_policy_mapping_from_grants(
        role_grants_mapping=role_grants_mapping,
        using_statement=using_statement,
        delete_using_statement=delete_using_statement,
    )

    policies = generate_rls_policies(role_policy_mapping, table)
