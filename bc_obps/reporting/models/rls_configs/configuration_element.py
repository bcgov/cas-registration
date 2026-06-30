from re import M
from reporting.enums.enums import ReportingTableNames
from rls.enums import RlsRoles, RlsOperations
from rls.utils.helpers import generate_rls_grants, generate_m2m_rls
from rls.utils.m2m import M2MPolicyStatements


class Rls:
    role_grants_mapping = {
        RlsRoles.INDUSTRY_USER: [RlsOperations.SELECT],
        RlsRoles.CAS_DIRECTOR: [RlsOperations.SELECT],
        RlsRoles.CAS_ADMIN: [RlsOperations.SELECT],
        RlsRoles.CAS_ANALYST: [RlsOperations.SELECT],
        RlsRoles.CAS_VIEW_ONLY: [RlsOperations.SELECT],
    }
    grants = generate_rls_grants(role_grants_mapping, ReportingTableNames.CONFIGURATION_ELEMENT)
    # M2M relationships
    m2m_models_grants_mapping = {
        ReportingTableNames.CONFIGURATION_ELEMENT_REPORTING_FIELDS: {
            RlsRoles.INDUSTRY_USER: [RlsOperations.SELECT],
            RlsRoles.CAS_DIRECTOR: [RlsOperations.SELECT],
            RlsRoles.CAS_ADMIN: [RlsOperations.SELECT],
            RlsRoles.CAS_ANALYST: [RlsOperations.SELECT],
            RlsRoles.CAS_VIEW_ONLY: [RlsOperations.SELECT],
        }
    }
    m2m_models_policy_mapping = {
        ReportingTableNames.CONFIGURATION_ELEMENT_REPORTING_FIELDS: M2MPolicyStatements(
            using_statement='true', delete_using_statement='true'
        ),
    }
    m2m_rls_list = generate_m2m_rls(m2m_models_grants_mapping, m2m_models_policy_mapping)
