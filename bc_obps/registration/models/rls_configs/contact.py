from registration.enums.enums import RegistrationTableNames
from rls.enums import RlsRoles, RlsOperations
from rls.utils.helpers import generate_rls_grants


class Rls:
    enable_rls = True
    schema = "erc"
    table = RegistrationTableNames.CONTACT
    role_grants_mapping = {
        RlsRoles.INDUSTRY_USER: [RlsOperations.SELECT, RlsOperations.INSERT, RlsOperations.UPDATE],
        # CAS_DIRECTOR can create new contacts when approving a user_operator
        RlsRoles.CAS_DIRECTOR: [RlsOperations.SELECT, RlsOperations.INSERT],
        RlsRoles.CAS_ADMIN: [RlsOperations.SELECT],
        # CAS_ANALYST can create new contacts when approving a user_operator
        RlsRoles.CAS_ANALYST: [RlsOperations.SELECT, RlsOperations.INSERT],
        RlsRoles.CAS_VIEW_ONLY: [RlsOperations.SELECT],
    }
    grants = generate_rls_grants(role_grants_mapping, RegistrationTableNames.CONTACT)
    policies = generate_rls_policies(
        role_grants_mapping=role_grants_mapping,
        table=RegistrationTableNames.CONTACT,
        using_statement="""
                    operator_id in (
        select uo.operator_id
        from erc.user_operator uo
        where uo.user_id = current_setting('my.guid', true)::uuid
          and uo.status = 'approved'
    )
                    """,
        check_statement="""
                    operator_id in (
        select uo.operator_id
        from erc.user_operator uo
        where uo.user_id = current_setting('my.guid', true)::uuid
          and uo.status = 'approved'
    )
                    """,
    )
