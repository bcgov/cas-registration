from registration.enums.enums import RegistrationTableNames
from rls.enums import RlsRoles, RlsOperations
from rls.utils.helpers import generate_rls_grants, generate_rls_policies, generate_policy_mapping


class Rls:
    enable_rls = True
    schema = 'erc'
    table = RegistrationTableNames.FACILITY_SNAPSHOT
    role_grants_mapping = {
        RlsRoles.INDUSTRY_USER: [
            RlsOperations.SELECT,
        ],
        # CAS_DIRECTOR and CAS_ANALYST need INSERT permission to create snapshots during transfers
        RlsRoles.CAS_DIRECTOR: [RlsOperations.SELECT, RlsOperations.INSERT],
        RlsRoles.CAS_ADMIN: [RlsOperations.SELECT],
        RlsRoles.CAS_ANALYST: [RlsOperations.SELECT, RlsOperations.INSERT],
        RlsRoles.CAS_VIEW_ONLY: [RlsOperations.SELECT],
    }
    grants = generate_rls_grants(role_grants_mapping, RegistrationTableNames.FACILITY_SNAPSHOT)

    industry_user_using_statement = """
        exists (
            select 1 from erc.operation_designated_operator_timeline t
            join erc.user_operator uo
            on uo.operator_id = t.operator_id
            and uo.user_id = current_setting('my.guid', true)::uuid
            and uo.status='Approved'
            and t.operation_id = facility_snapshot.operation_id
        )
    """

    role_operation_policy_map = {
        RlsRoles.INDUSTRY_USER: [
            {RlsOperations.SELECT.value: industry_user_using_statement},
        ],
        RlsRoles.CAS_DIRECTOR: [
            {RlsOperations.SELECT.value: "true"},
            {RlsOperations.INSERT.value: "true"},
        ],
        RlsRoles.CAS_ADMIN: [{RlsOperations.SELECT.value: "true"}],
        RlsRoles.CAS_ANALYST: [
            {RlsOperations.SELECT.value: "true"},
            {RlsOperations.INSERT.value: "true"},
        ],
        RlsRoles.CAS_VIEW_ONLY: [{RlsOperations.SELECT.value: "true"}],
    }

    role_policy_mapping = generate_policy_mapping(
        role_operation_policy_mapping=role_operation_policy_map,
    )

    policies = generate_rls_policies(role_policy_mapping, table)
