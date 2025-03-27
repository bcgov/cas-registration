from compliance.enums import ComplianceTableNames
from rls.enums import RlsRoles, RlsOperations
from rls.utils.helpers import generate_rls_grants


class Rls:
    """
    RLS configuration for the ELicensingLink model
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

    # Standard grants for the ELicensingLink table
    grants = generate_rls_grants(role_grants_mapping, ComplianceTableNames.ELICENSING_LINK)
