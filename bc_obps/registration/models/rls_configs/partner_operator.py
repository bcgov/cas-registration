from registration.enums.enums import RegistrationTableNames
from rls.enums import RlsRoles, RlsOperations
from rls.utils.helpers import generate_rls_grants, generate_rls_policies


class Rls:
    enable_rls = True
    schema = "erc"
    table = RegistrationTableNames.PARTNER_OPERATOR
    role_grants_mapping = {
        RlsRoles.INDUSTRY_USER: [RlsOperations.SELECT, RlsOperations.INSERT, RlsOperations.UPDATE],
        RlsRoles.CAS_DIRECTOR: [RlsOperations.SELECT],
        RlsRoles.CAS_ADMIN: [RlsOperations.SELECT],
        RlsRoles.CAS_ANALYST: [RlsOperations.SELECT],
        RlsRoles.CAS_VIEW_ONLY: [RlsOperations.SELECT],
    }
    grants = generate_rls_grants(role_grants_mapping, RegistrationTableNames.PARTNER_OPERATOR)
    policies = generate_rls_policies(
        role_grants_mapping=role_grants_mapping,
        table=RegistrationTableNames.PARTNER_OPERATOR,
        using_statement="""
                    bc_obps_operator_id IN (
        SELECT uo.operator_id
        FROM erc.user_operator uo
        WHERE uo.user_id = current_setting('my.guid', true)::uuid
          AND uo.status = 'Approved'
    )
                    """,
        check_statement="""
                    bc_obps_operator_id IN (
        SELECT uo.operator_id
        FROM erc.user_operator uo
        WHERE uo.user_id = current_setting('my.guid', true)::uuid
          AND uo.status = 'Approved'
    )
                    """,
    )
