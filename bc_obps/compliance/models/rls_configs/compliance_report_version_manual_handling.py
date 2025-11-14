from compliance.enums import ComplianceTableNames
from rls.enums import RlsRoles, RlsOperations
from rls.utils.helpers import (
    generate_report_policy_mapping_from_grants,
    generate_rls_grants,
    generate_rls_policies,
)


class Rls:
    """
    RLS configuration for the compliance report manual handling model
    """

    enable_rls = True
    schema = "erc"
    table = ComplianceTableNames.COMPLIANCE_REPORT_VERSION_MANUAL_HANDLING

    # Only allow access to manual-handling records for CRVs the user can see
    using_statement = """
        compliance_report_version_id IN (
            SELECT crv.id
            FROM erc.compliance_report_version crv
            JOIN erc.compliance_report cr ON cr.id = crv.compliance_report_id
            JOIN erc.report r ON r.id = cr.report_id
            JOIN erc.operation o ON o.id = r.operation_id
            JOIN erc.user_operator uo ON uo.operator_id = o.id
            WHERE uo.user_id = current_setting('my.guid', true)::uuid
              AND uo.status = 'Approved'
        )
    """

    # Industry users: read-only
    # CAS staff: can read and write
    role_grants_mapping = {
        RlsRoles.INDUSTRY_USER: [RlsOperations.SELECT],
        RlsRoles.CAS_VIEW_ONLY: [RlsOperations.SELECT],
        RlsRoles.CAS_ANALYST: [RlsOperations.SELECT, RlsOperations.INSERT, RlsOperations.UPDATE],
        RlsRoles.CAS_DIRECTOR: [RlsOperations.SELECT, RlsOperations.INSERT, RlsOperations.UPDATE],
        RlsRoles.CAS_ADMIN: [RlsOperations.SELECT, RlsOperations.INSERT, RlsOperations.UPDATE],
    }

    grants = generate_rls_grants(
        role_grants_mapping,
        ComplianceTableNames.COMPLIANCE_REPORT_VERSION_MANUAL_HANDLING,
    )

    role_policy_mapping = generate_report_policy_mapping_from_grants(
        role_grants_mapping,
        using_statement,
        using_statement,
    )

    policies = generate_rls_policies(role_policy_mapping, table)
