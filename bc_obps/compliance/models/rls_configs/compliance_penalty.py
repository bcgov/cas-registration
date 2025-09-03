from compliance.enums import ComplianceTableNames
from rls.enums import RlsRoles, RlsOperations
from rls.utils.helpers import generate_report_policy_mapping_from_grants, generate_rls_grants, generate_rls_policies


class Rls:
    enable_rls = True
    schema = "erc"
    table = ComplianceTableNames.COMPLIANCE_PENALTY
    using_statement = """
        elicensing_invoice_id IN (
            SELECT ei.id
            FROM erc.elicensing_invoice ei
            JOIN erc.elicensing_client_operator eco ON eco.id = ei.elicensing_client_operator_id
            JOIN erc.operator o ON o.id = eco.operator_id
            JOIN erc.user_operator uo ON uo.operator_id = o.id
            WHERE uo.user_id = current_setting('my.guid', true)::uuid
            AND uo.status = 'Approved'
        )
    """
    role_grants_mapping = {
        RlsRoles.INDUSTRY_USER: [
            RlsOperations.SELECT,
            RlsOperations.INSERT,
            RlsOperations.UPDATE,
        ],
        RlsRoles.CAS_DIRECTOR: [RlsOperations.SELECT],
        RlsRoles.CAS_ADMIN: [RlsOperations.SELECT],
        RlsRoles.CAS_ANALYST: [RlsOperations.SELECT],
        RlsRoles.CAS_VIEW_ONLY: [RlsOperations.SELECT],
    }
    grants = generate_rls_grants(role_grants_mapping, ComplianceTableNames.COMPLIANCE_PENALTY)
    role_policy_mapping = generate_report_policy_mapping_from_grants(
        role_grants_mapping, using_statement, using_statement
    )
    policies = generate_rls_policies(role_policy_mapping, table)
