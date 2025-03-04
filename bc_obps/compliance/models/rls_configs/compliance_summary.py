from compliance.enums import ComplianceTableNames
from rls.enums import RlsRoles, RlsOperations
from rls.utils.helpers import generate_rls_grants


class Rls:
    role_grants_mapping = {
        # Industry users can view their own compliance summaries
        RlsRoles.INDUSTRY_USER: [RlsOperations.SELECT],
        # CAS staff can manage compliance summaries
        RlsRoles.CAS_DIRECTOR: [
            RlsOperations.SELECT,
            RlsOperations.INSERT,
            RlsOperations.UPDATE,
            RlsOperations.DELETE,
        ],
        RlsRoles.CAS_ADMIN: [
            RlsOperations.SELECT,
            RlsOperations.INSERT,
            RlsOperations.UPDATE,
        ],
        RlsRoles.CAS_ANALYST: [
            RlsOperations.SELECT,
            RlsOperations.INSERT,
            RlsOperations.UPDATE,
        ],
        RlsRoles.CAS_VIEW_ONLY: [RlsOperations.SELECT],
    }
    grants = generate_rls_grants(role_grants_mapping, ComplianceTableNames.COMPLIANCE_SUMMARY) 