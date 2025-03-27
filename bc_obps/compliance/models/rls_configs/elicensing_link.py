from compliance.enums import ComplianceTableNames, DjangoTableNames
from rls.enums import RlsRoles, RlsOperations
from rls.utils.helpers import generate_rls_grants


class Rls:
    """
    RLS configuration for the ELicensingLink model
    """

    elicensing_link_role_grants_mapping = {
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
    elicensing_link_grants = generate_rls_grants(
        elicensing_link_role_grants_mapping, ComplianceTableNames.ELICENSING_LINK
    )

    # Grants for the django_content_type table in public schema
    content_type_role_grants_mapping = {
        RlsRoles.INDUSTRY_USER: [RlsOperations.SELECT],
        RlsRoles.CAS_DIRECTOR: [RlsOperations.SELECT],
        RlsRoles.CAS_ADMIN: [RlsOperations.SELECT],
        RlsRoles.CAS_ANALYST: [RlsOperations.SELECT],
        RlsRoles.CAS_VIEW_ONLY: [RlsOperations.SELECT],
    }

    content_type_grants = generate_rls_grants(
        content_type_role_grants_mapping, DjangoTableNames.DJANGO_CONTENT_TYPE, DjangoTableNames.PUBLIC_SCHEMA
    )

    grants = elicensing_link_grants + content_type_grants
