from registration.enums.enums import RegistrationTableNames
from rls.enums import RlsRoles, RlsOperations
from rls.utils.helpers import generate_rls_grants, generate_m2m_rls
from rls.utils.m2m import M2MPolicyStatements


# At the time of writing, the ClosureEvent model does not have any fields that need to be protected by RLS.
class Rls:
    role_grants_mapping = {
        RlsRoles.CAS_DIRECTOR: [RlsOperations.SELECT],
        RlsRoles.CAS_ADMIN: [RlsOperations.SELECT],
        RlsRoles.CAS_ANALYST: [RlsOperations.SELECT],
        RlsRoles.CAS_VIEW_ONLY: [RlsOperations.SELECT],
    }
    grants = generate_rls_grants(role_grants_mapping, RegistrationTableNames.CLOSURE_EVENT)
    # M2M relationships
    m2m_models_grants_mapping = {
        RegistrationTableNames.CLOSURE_EVENT_FACILITIES: {
            RlsRoles.INDUSTRY_USER: [
                RlsOperations.SELECT,
                RlsOperations.DELETE,
            ],  # Industry User needs delete permission for the specific flow when changing registration purpose from EIO
            RlsRoles.CAS_DIRECTOR: [RlsOperations.SELECT],
            RlsRoles.CAS_ADMIN: [RlsOperations.SELECT],
            RlsRoles.CAS_ANALYST: [RlsOperations.SELECT],
            RlsRoles.CAS_VIEW_ONLY: [RlsOperations.SELECT],
        }
    }
    m2m_models_policies_mapping = {
        RegistrationTableNames.CLOSURE_EVENT_FACILITIES: M2MPolicyStatements(
            using_statement='true', delete_using_statement='true'
        ),
    }
    m2m_rls_list = generate_m2m_rls(m2m_models_grants_mapping, m2m_models_policies_mapping)
