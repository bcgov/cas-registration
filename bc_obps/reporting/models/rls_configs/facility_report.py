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
    table = ReportingTableNames.FACILITY_REPORT
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
    m2m_models_grants_mapping = {
        ReportingTableNames.FACILITY_REPORT_ACTIVITIES: {
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
    }

    facility_report_activities_using_statement = """
        exists (
            select 1 from erc.facility_report fr where fr.id = facilityreport_id
        )
    """
    facility_report_activities_delete_using_statement = """
        exists (
            select 1 from erc.facility_report fr
            join erc.report_version rv
                on fr.report_version_id = rv.id
                and rv.status = 'Draft'
                and fr.id = facilityreport_id
        )
    """

    m2m_models_policy_mapping = {
        ReportingTableNames.FACILITY_REPORT_ACTIVITIES: M2MPolicyStatements(
            using_statement=facility_report_activities_using_statement,
            delete_using_statement=facility_report_activities_delete_using_statement,
        ),
    }
    m2m_rls_list = generate_m2m_rls(m2m_models_grants_mapping, m2m_models_policy_mapping, enable_rls)

    role_policy_mapping = generate_report_policy_mapping_from_grants(
        role_grants_mapping=role_grants_mapping,
        using_statement=RlsPolicy.REPORT_USING_STATEMENT,
        delete_using_statement=RlsPolicy.REPORT_DELETE_USING_STATEMENT,
    )

    policies = generate_rls_policies(role_policy_mapping, table)
