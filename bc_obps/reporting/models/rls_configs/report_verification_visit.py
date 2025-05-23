from reporting.enums.enums import ReportingTableNames
from rls.enums import RlsRoles, RlsOperations
from rls.utils.helpers import generate_rls_grants


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
    grants = generate_rls_grants(role_grants_mapping, ReportingTableNames.REPORT_VERIFICATION_VISIT)

    using_statement = """
        report_verification_id IN (
            SELECT rver.id
            FROM report_verification rver
            WHERE rver.report_version_id IN (
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
        )"""
