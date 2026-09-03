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
        exists (
            select 1 from erc.compliance_report_version crv where crv.id = compliance_report_version_id
        )
"""

    # Industry users: create + read
    # CAS staff: can read and analyst/director can write
    role_grants_mapping = {
        RlsRoles.INDUSTRY_USER: [RlsOperations.SELECT, RlsOperations.INSERT],
        RlsRoles.CAS_VIEW_ONLY: [RlsOperations.SELECT],
        RlsRoles.CAS_ANALYST: [RlsOperations.SELECT, RlsOperations.UPDATE],
        RlsRoles.CAS_DIRECTOR: [RlsOperations.SELECT, RlsOperations.UPDATE],
        RlsRoles.CAS_ADMIN: [RlsOperations.SELECT],
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
