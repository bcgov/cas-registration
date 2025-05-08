from reporting.enums.enums import ReportingTableNames
from rls.enums import RlsRoles, RlsOperations
from rls.utils.helpers import generate_rls_grants, generate_m2m_rls, generate_rls_policies
from rls.utils.policy import RlsPolicy


class Rls:
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
    grants = generate_rls_grants(role_grants_mapping, ReportingTableNames.FACILITY_REPORT)
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
    m2m_rls_list = generate_m2m_rls(m2m_models_grants_mapping)

    using_statement = """
                report_version_id IN (
                    SELECT rv.id
                    FROM report_version rv
                    JOIN report r ON rv.report_id = r.id
                    WHERE r.operator_id IN (
                        SELECT uo.operator_id
                        FROM user_operator uo
                        WHERE uo.user_id IN (select current_setting('my.guid', true))
                        AND uo.status = 'Approved'
                    )
                )
                """

    policies = generate_rls_policies(
        roles=RlsRoles,
        operations=RlsOperations,
        table=ReportingTableNames.FACILITY_REPORT,
        using_statement=using_statement,
    )
    # policies = [
    #     RlsPolicy(
    #         role=RlsRoles.INDUSTRY_USER,
    #         policy_name="facility_report_industry_select_policy",
    #         operation=RlsOperations.SELECT,
    #         table=ReportingTableNames.FACILITY_REPORT,
    #         using_statement=using_statement,
    #     ),
    #     RlsPolicy(
    #         role=RlsRoles.INDUSTRY_USER,
    #         policy_name="facility_report_industry_insert_policy",
    #         operation=RlsOperations.INSERT,
    #         table=ReportingTableNames.FACILITY_REPORT,
    #         using_statement=using_statement,
    #         check_statement=using_statement,
    #     ),
    #     RlsPolicy(
    #         role=RlsRoles.INDUSTRY_USER,
    #         policy_name="facility_report_industry_update_policy",
    #         operation=RlsOperations.UPDATE,
    #         table=ReportingTableNames.FACILITY_REPORT,
    #         using_statement=using_statement,
    #         check_statement=using_statement,
    #     ),
    #     RlsPolicy(
    #         role=RlsRoles.INDUSTRY_USER,
    #         policy_name="facility_report_industry_delete_policy",
    #         operation=RlsOperations.DELETE,
    #         table=ReportingTableNames.FACILITY_REPORT,
    #         using_statement="""
    #             report_version_id IN (
    #                 SELECT rv.id
    #                 FROM report_version rv
    #                 JOIN report r ON rv.report_id = r.id
    #                 WHERE r.operator_id IN (
    #                     SELECT uo.operator_id
    #                     FROM user_operator uo
    #                     WHERE uo.user_id IN (select current_setting('my.guid', true))
    #                     AND uo.status = 'Approved'
    #                     AND rv.status = 'Draft'
    #                 )
    #             )
    #             """,
    #     ),
    # ]
    # for role in RlsRoles:
    #     if role == RlsRoles.INDUSTRY_USER:
    #         continue
    #     policy = RlsPolicy(
    #         role=role,
    #         policy_name=f"facility_report_{role.name.lower()}_all_operations_policy",
    #         operation="ALL",
    #         table=ReportingTableNames.FACILITY_REPORT,
    #         using_statement="true",
    #     )
    #     policies.append(policy)
