from registration.enums.enums import RegistrationTableNames
from rls.enums import RlsRoles, RlsOperations
from rls.utils.helpers import generate_rls_grants, generate_m2m_rls


class Rls:
    role_grants_mapping = {
        RlsRoles.INDUSTRY_USER: [RlsOperations.SELECT, RlsOperations.INSERT, RlsOperations.UPDATE],
        # To issue BORO ID and BCGHG ID
        RlsRoles.CAS_DIRECTOR: [RlsOperations.SELECT, RlsOperations.UPDATE],
        RlsRoles.CAS_ADMIN: [RlsOperations.SELECT],
        # CAS_ANALYST needs to be able to update the operator_id field when transferring an operation
        RlsRoles.CAS_ANALYST: [RlsOperations.SELECT, RlsOperations.UPDATE],
        RlsRoles.CAS_VIEW_ONLY: [RlsOperations.SELECT],
    }
    grants = generate_rls_grants(role_grants_mapping, RegistrationTableNames.OPERATION)
    # M2M relationships
    m2m_models_grants_mapping = {
        RegistrationTableNames.OPERATION_CONTACTS: {
            RlsRoles.INDUSTRY_USER: [
                RlsOperations.SELECT,
                RlsOperations.INSERT,
                RlsOperations.UPDATE,
                RlsOperations.DELETE,  # Granting this permission so that user can remove the instance from the through table
            ],
            RlsRoles.CAS_DIRECTOR: [RlsOperations.SELECT],
            RlsRoles.CAS_ADMIN: [RlsOperations.SELECT],
            RlsRoles.CAS_ANALYST: [
                RlsOperations.SELECT,
                RlsOperations.DELETE,
            ],  # Granting this permission so that user can remove the instance from the through table when transferring an operation,
            RlsRoles.CAS_VIEW_ONLY: [RlsOperations.SELECT],
        },
        RegistrationTableNames.OPERATION_REGULATED_PRODUCTS: {
            RlsRoles.INDUSTRY_USER: [
                RlsOperations.SELECT,
                RlsOperations.INSERT,
                RlsOperations.UPDATE,
                RlsOperations.DELETE,  # Granting this permission so that user can remove the instance from the through table
            ],
            RlsRoles.CAS_DIRECTOR: [RlsOperations.SELECT],
            RlsRoles.CAS_ADMIN: [RlsOperations.SELECT],
            RlsRoles.CAS_ANALYST: [RlsOperations.SELECT],
            RlsRoles.CAS_VIEW_ONLY: [RlsOperations.SELECT],
        },
        RegistrationTableNames.OPERATION_ACTIVITIES: {
            RlsRoles.INDUSTRY_USER: [
                RlsOperations.SELECT,
                RlsOperations.INSERT,
                RlsOperations.UPDATE,
                RlsOperations.DELETE,  # Granting this permission so that user can remove the instance from the through table
            ],
            RlsRoles.CAS_DIRECTOR: [RlsOperations.SELECT],
            RlsRoles.CAS_ADMIN: [RlsOperations.SELECT],
            RlsRoles.CAS_ANALYST: [RlsOperations.SELECT],
            RlsRoles.CAS_VIEW_ONLY: [RlsOperations.SELECT],
        },
    }
    m2m_rls_list = generate_m2m_rls(m2m_models_grants_mapping)
