from registration.enums.enums import RegistrationTableNames
from rls.enums import RlsRoles, RlsOperations
from rls.utils.helpers import generate_rls_grants, generate_policy_mapping, generate_rls_policies


class Rls:
    enable_rls = True
    schema = "erc"
    table = RegistrationTableNames.USER

    role_grants_mapping = {
        RlsRoles.INDUSTRY_USER: [RlsOperations.SELECT, RlsOperations.INSERT, RlsOperations.UPDATE],
        RlsRoles.CAS_DIRECTOR: [RlsOperations.SELECT, RlsOperations.INSERT, RlsOperations.UPDATE],
        RlsRoles.CAS_ADMIN: [RlsOperations.SELECT, RlsOperations.INSERT, RlsOperations.UPDATE],
        RlsRoles.CAS_ANALYST: [RlsOperations.SELECT, RlsOperations.INSERT, RlsOperations.UPDATE],
        RlsRoles.CAS_VIEW_ONLY: [RlsOperations.SELECT, RlsOperations.INSERT, RlsOperations.UPDATE],
        RlsRoles.CAS_PENDING: [RlsOperations.SELECT, RlsOperations.INSERT, RlsOperations.UPDATE],
    }
    grants = generate_rls_grants(role_grants_mapping, RegistrationTableNames.USER)

    using_statement = """
        user_guid = current_setting('my.guid', true)::uuid
    """

    role_operation_policy_map = {
        RlsRoles.INDUSTRY_USER: [
            {RlsOperations.SELECT.value: using_statement},
            {RlsOperations.INSERT.value: using_statement},
            {RlsOperations.UPDATE.value: using_statement},
        ],
        RlsRoles.CAS_DIRECTOR: [
            {RlsOperations.SELECT.value: using_statement},
            {RlsOperations.INSERT.value: using_statement},
            {RlsOperations.UPDATE.value: using_statement},
        ],
        RlsRoles.CAS_ADMIN: [
            {RlsOperations.SELECT.value: using_statement},
            {RlsOperations.INSERT.value: using_statement},
            {RlsOperations.UPDATE.value: 'true'},
        ],
        RlsRoles.CAS_ANALYST: [
            {RlsOperations.SELECT.value: using_statement},
            {RlsOperations.INSERT.value: using_statement},
            {RlsOperations.UPDATE.value: using_statement},
        ],
        RlsRoles.CAS_VIEW_ONLY: [
            {RlsOperations.SELECT.value: using_statement},
            {RlsOperations.INSERT.value: using_statement},
            {RlsOperations.UPDATE.value: using_statement},
        ],
    }

    role_policy_mapping = generate_policy_mapping(
        role_operation_policy_mapping=role_operation_policy_map,
    )

    policies = generate_rls_policies(role_policy_mapping, table)
