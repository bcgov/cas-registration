from registration.enums.enums import RegistrationTableNames
from rls.enums import RlsRoles, RlsOperations
from rls.utils.helpers import generate_rls_grants, generate_policy_mapping, generate_rls_policies


class Rls:
    enable_rls = True
    schema = "erc"
    table = RegistrationTableNames.USER_OPERATOR
    role_grants_mapping = {
        # INDUSTRY_USER can delete their own user operator (Their own access request)
        RlsRoles.INDUSTRY_USER: [
            RlsOperations.SELECT,
            RlsOperations.INSERT,
            RlsOperations.UPDATE,
            RlsOperations.DELETE,
        ],
        # CAS_DIRECTOR can Approve or Decline the user operator (Admin request)
        RlsRoles.CAS_DIRECTOR: [RlsOperations.SELECT, RlsOperations.UPDATE],
        RlsRoles.CAS_ADMIN: [RlsOperations.SELECT],
        # CAS_ANALYST can Approve or Decline the user operator (Admin request)
        RlsRoles.CAS_ANALYST: [RlsOperations.SELECT, RlsOperations.UPDATE],
        RlsRoles.CAS_VIEW_ONLY: [RlsOperations.SELECT],
    }
    grants = generate_rls_grants(role_grants_mapping, RegistrationTableNames.USER_OPERATOR)

    industry_user_using_statement = """
        user_id = current_setting('my.guid', true)::uuid
    """

    role_operation_policy_map = {
        RlsRoles.INDUSTRY_USER: [
            {RlsOperations.SELECT.value: 'true'},
            {RlsOperations.INSERT.value: industry_user_using_statement},
            {RlsOperations.UPDATE.value: 'true'},
            {RlsOperations.DELETE.value: industry_user_using_statement},
        ],
        RlsRoles.CAS_DIRECTOR: [{RlsOperations.SELECT.value: "true", RlsOperations.UPDATE.value: "true"}],
        RlsRoles.CAS_ADMIN: [{RlsOperations.SELECT.value: "true"}],
        RlsRoles.CAS_ANALYST: [{RlsOperations.SELECT.value: "true", RlsOperations.UPDATE.value: "true"}],
        RlsRoles.CAS_VIEW_ONLY: [{RlsOperations.SELECT.value: "true"}],
    }

    role_policy_mapping = generate_policy_mapping(
        role_operation_policy_mapping=role_operation_policy_map,
    )

    policies = generate_rls_policies(role_policy_mapping, table)
