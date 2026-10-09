from reporting.enums.enums import ReportingTableNames
from rls.enums import RlsRoles, RlsOperations
from rls.utils.helpers import (
    generate_report_policy_mapping_from_grants,
    generate_rls_grants,
    generate_m2m_rls,
    generate_rls_policies,
)
from rls.utils.m2m import M2MPolicyStatements
from rls.utils.policy import RlsPolicy


class Rls:
    enable_rls = True
    schema = 'erc'
    table = ReportingTableNames.REPORT_OPERATION
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
    grants = generate_rls_grants(role_grants_mapping, table)
    # M2M relationships
    m2m_models_grants_mapping = {
        ReportingTableNames.REPORT_OPERATION_ACTIVITIES: {
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
        },
        ReportingTableNames.REPORT_OPERATION_REGULATED_PRODUCTS: {
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
        },
    }
    report_operation_m2m_using_statement = """
        exists (
            select 1 from erc.report_operation ro where ro.id = reportoperation_id
        )
    """
    report_operation_m2m_delete_using_statement = """
        exists (
            select 1 from erc.report_operation ro
            join erc.report_version rv
            on ro.report_version_id = rv.id
            and rv.status = 'Draft'
            and ro.id = reportoperation_id
        )
    """
    m2m_models_policy_mapping = {
        ReportingTableNames.REPORT_OPERATION_ACTIVITIES: M2MPolicyStatements(
            using_statement=report_operation_m2m_using_statement,
            delete_using_statement=report_operation_m2m_delete_using_statement,
        ),
        ReportingTableNames.REPORT_OPERATION_REGULATED_PRODUCTS: M2MPolicyStatements(
            using_statement=report_operation_m2m_using_statement,
            delete_using_statement=report_operation_m2m_delete_using_statement,
        ),
    }
    m2m_rls_list = generate_m2m_rls(m2m_models_grants_mapping, m2m_models_policy_mapping, enable_rls)

    role_policy_mapping = generate_report_policy_mapping_from_grants(
        role_grants_mapping,
        RlsPolicy.REPORT_USING_STATEMENT,
        RlsPolicy.REPORT_DELETE_USING_STATEMENT,
    )

    policies = generate_rls_policies(role_policy_mapping, table)
