from rls.utils.policy import RlsPolicy
from reporting.enums.enums import ReportingTableNames
from rls.enums import RlsRoles, RlsOperations
from rls.utils.helpers import generate_report_policy_mapping_from_grants, generate_rls_grants, generate_rls_policies


class Rls:
    enable_rls = True
    schema = 'erc'
    table = ReportingTableNames.REPORT_RAW_ACTIVITY_DATA
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
        facility_report_id IN (
            SELECT fr.id
            FROM erc.facility_report fr
            JOIN erc.report_version rv ON fr.report_version_id = rv.id
            JOIN erc.report r ON rv.report_id = r.id
            WHERE r.operator_id IN (
                SELECT uo.operator_id
                FROM erc.user_operator uo
                WHERE uo.user_id = current_setting('my.guid', true)::uuid
                AND uo.status = 'Approved'
            )
        )
    """
    delete_using_statement = RlsPolicy.add_draft_check_to_report_using_statement(using_statement)
    role_policy_mapping = generate_report_policy_mapping_from_grants(
        role_grants_mapping, using_statement, delete_using_statement
    )
    policies = generate_rls_policies(role_policy_mapping, table)
