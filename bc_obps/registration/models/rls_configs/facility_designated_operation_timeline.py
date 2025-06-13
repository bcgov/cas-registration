from registration.enums.enums import RegistrationTableNames
from rls.enums import RlsRoles, RlsOperations
from rls.utils.helpers import generate_rls_grants, generate_rls_policies


class Rls:
    enable_rls = True
    schema = "erc"
    table = RegistrationTableNames.FACILITY_DESIGNATED_OPERATION_TIMELINE
    role_grants_mapping = {
        RlsRoles.INDUSTRY_USER: [
            RlsOperations.SELECT,
            RlsOperations.INSERT,
            RlsOperations.DELETE,
        ],  # Industry User needs delete permission for the specific flow when changing registration purpose from EIO
        RlsRoles.CAS_DIRECTOR: [RlsOperations.SELECT],
        RlsRoles.CAS_ADMIN: [RlsOperations.SELECT],
        # CAS_ANALYST can do Transfers
        RlsRoles.CAS_ANALYST: [RlsOperations.SELECT, RlsOperations.INSERT, RlsOperations.UPDATE],
        RlsRoles.CAS_VIEW_ONLY: [RlsOperations.SELECT],
    }
    grants = generate_rls_grants(role_grants_mapping, RegistrationTableNames.FACILITY_DESIGNATED_OPERATION_TIMELINE)
    policies = generate_rls_policies(
        role_grants_mapping=role_grants_mapping,
        table=RegistrationTableNames.FACILITY_DESIGNATED_OPERATION_TIMELINE,
        using_statement="""
                     operation_id in
                     (select id
        from erc.operation
        where operator_id IN
        (
        SELECT uo.operator_id
        FROM erc.user_operator uo
        WHERE uo.user_id = current_setting('my.guid', true)::uuid
          AND uo.status = 'Approved')
          )

                    """,
        check_statement="""
                     operation_id in
                     (select id
        from erc.operation
        where operator_id IN
        (
        SELECT uo.operator_id
        FROM erc.user_operator uo
        WHERE uo.user_id = current_setting('my.guid', true)::uuid
          AND uo.status = 'Approved')
          )

                    """,
    )
