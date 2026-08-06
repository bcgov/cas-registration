from reporting.enums.enums import ReportingTableNames
from rls.enums import RlsRoles, RlsOperations
from rls.utils.helpers import generate_rls_grants, generate_rls_policies, generate_report_policy_mapping_from_grants


class Rls:
    enable_rls = True
    schema = 'erc'
    table = ReportingTableNames.REPORT
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

    using_statement = """
        exists (
            with approved_operator as (
                select operator_id from erc.user_operator where
                user_id = current_setting('my.guid', true)::uuid
                and status='Approved'
            )
            select 1 from erc.operation_designated_operator_timeline tline
            join approved_operator ao on ao.operator_id = tline.operator_id
            and tline.operation_id = report.operation_id
            and (start_date <= concat(report.reporting_year_id::text, '-12-31')::date and (end_date is null or end_date >= concat(report.reporting_year_id::text, '-12-31')::date))
        )"""

    role_policy_mapping = generate_report_policy_mapping_from_grants(
        role_grants_mapping=role_grants_mapping,
        using_statement=using_statement,
        delete_using_statement=using_statement,
    )

    policies = generate_rls_policies(
        role_policy_mapping=role_policy_mapping,
        table=table,
    )
