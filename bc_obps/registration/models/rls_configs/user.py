from registration.enums.enums import RegistrationTableNames
from rls.enums import RlsRoles, RlsOperations
from rls.utils.helpers import generate_report_policy_mapping_from_grants, generate_rls_grants, generate_rls_policies


class Rls:
    enable_rls = True
    schema = "erc"
    table = RegistrationTableNames.USER
    using_statement = (
        """
                user_guid IN (
    SELECT uo.user_id
    FROM erc.user_operator uo
    WHERE uo.user_id = current_setting('my.guid', true)::uuid
        AND uo.status = 'Approved'
)
                """,
    )
    # brianna
    check_statement = (
        """
                True

                """,
    )
    role_grants_mapping = {
        RlsRoles.INDUSTRY_USER: [RlsOperations.SELECT, RlsOperations.INSERT, RlsOperations.UPDATE],
        RlsRoles.CAS_DIRECTOR: [RlsOperations.SELECT, RlsOperations.INSERT, RlsOperations.UPDATE],
        RlsRoles.CAS_ADMIN: [RlsOperations.SELECT, RlsOperations.INSERT, RlsOperations.UPDATE],
        RlsRoles.CAS_ANALYST: [RlsOperations.SELECT, RlsOperations.INSERT, RlsOperations.UPDATE],
        RlsRoles.CAS_VIEW_ONLY: [RlsOperations.SELECT, RlsOperations.INSERT, RlsOperations.UPDATE],
        RlsRoles.CAS_PENDING: [RlsOperations.SELECT, RlsOperations.INSERT],
    }
    grants = generate_rls_grants(role_grants_mapping, RegistrationTableNames.USER)
    role_policy_mapping = generate_report_policy_mapping_from_grants(
        role_grants_mapping, using_statement, using_statement
    )
    policies = generate_rls_policies(role_policy_mapping, table)
