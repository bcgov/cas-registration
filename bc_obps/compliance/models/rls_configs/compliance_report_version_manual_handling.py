from compliance.enums import ComplianceTableNames
from rls.enums import RlsRoles, RlsOperations
from rls.utils.helpers import (
    generate_report_policy_mapping_from_grants,
    generate_rls_grants,
    generate_rls_policies,
)


class Rls:
    """
    RLS configuration for the compliance report manual handling model.

    Rules:
      - Industry users:
          * Can read existing manual-handling records
          * Can create (INSERT) manual-handling records
          * Cannot update or delete existing records
      - CAS staff:
          * View-only: read-only
          * Analyst / Director / Admin: read + insert + update
    """

    enable_rls = True
    schema = "erc"
    table = ComplianceTableNames.COMPLIANCE_REPORT_VERSION_MANUAL_HANDLING

    # Industry users can only see/insert records for CRVs attached to reports where they are an
    # Approved user_operator.
    using_statement = """
compliance_report_version_id IN (
    SELECT crv.id
    FROM erc.compliance_report_version crv
    JOIN erc.compliance_report cr ON crv.compliance_report_id = cr.id
    JOIN erc.report r ON cr.report_id = r.id
    JOIN erc.user_operator uo ON uo.operator_id = r.operator_id
    WHERE uo.user_id = current_setting('my.guid', true)::uuid
      AND uo.status = 'Approved'
)
"""

    delete_using_statement = """
        compliance_report_version_id IN (
            SELECT crv.id
            FROM erc.compliance_report_version crv
            JOIN erc.compliance_report cr ON crv.compliance_report_id = cr.id
            JOIN erc.report r ON cr.report_id = r.id
            JOIN erc.operation o ON r.operation_id = o.id
            JOIN erc.user_operator uo ON o.operator_id = uo.operator_id
            AND uo.user_id = current_setting('my.guid', true)::uuid
            AND uo.status = 'Approved'
            AND crv.status='Superceded'
        )
    """
    
    # Industry users: create + read
    # CAS staff: can read and write
    role_grants_mapping = {
        RlsRoles.INDUSTRY_USER: [RlsOperations.SELECT, RlsOperations.INSERT],
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
        using_statement,        # USING for SELECT/UPDATE
        delete_using_statement, # WITH CHECK / delete USING
    )

    policies = generate_rls_policies(role_policy_mapping, table)
