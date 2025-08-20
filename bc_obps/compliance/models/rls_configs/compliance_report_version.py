from compliance.enums import ComplianceTableNames
from rls.enums import RlsRoles, RlsOperations
from rls.utils.helpers import generate_m2m_rls, generate_report_policy_mapping_from_grants, generate_rls_grants, generate_rls_policies


class Rls:
    enable_rls = True
    schema = "erc"
    table = ComplianceTableNames.COMPLIANCE_REPORT_VERSION
    using_statement = """
        compliance_report_id IN (
            SELECT cr.id 
            FROM erc.compliance_report cr
            JOIN erc.report r ON cr.report_id = r.id 
            JOIN erc.operation o ON r.operation_id = o.id
            JOIN erc.user_operator uo ON o.operator_id = uo.operator_id
            WHERE uo.user_id = current_setting('my.guid', true)::uuid
                AND uo.status = 'Approved'
                AND o.status = 'Registered'
        )
    """
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
    grants = generate_rls_grants(role_grants_mapping, ComplianceTableNames.COMPLIANCE_REPORT_VERSION)
    role_policy_mapping = generate_report_policy_mapping_from_grants(
        role_grants_mapping, using_statement, using_statement
    )
    policies = generate_rls_policies(role_policy_mapping, table)