from registration.enums.enums import RegistrationTableNames
from rls.enums import RlsRoles, RlsOperations
from rls.utils.helpers import generate_rls_grants, generate_rls_policies, generate_policy_mapping


class Rls:
    enable_rls = True
    schema = 'erc'
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

    industry_user_using_statement = """
            exists (
                select 1 from erc.user_operator uo
                where uo.user_id = current_setting('my.guid', true)::uuid
                and uo.operator_id = contact.operator_id
                and uo.status='Approved'
            )
        """

    role_operation_policy_map = {
        RlsRoles.INDUSTRY_USER: [
            {RlsOperations.SELECT.value: industry_user_using_statement},
            {RlsOperations.INSERT.value: industry_user_using_statement},
            {RlsOperations.UPDATE.value: industry_user_using_statement},
        ],
        RlsRoles.CAS_DIRECTOR: [{RlsOperations.SELECT.value: "true"}, {RlsOperations.INSERT.value: "true"}],
        RlsRoles.CAS_ADMIN: [{RlsOperations.SELECT.value: "true"}],
        RlsRoles.CAS_ANALYST: [{RlsOperations.SELECT.value: "true"}, {RlsOperations.INSERT.value: "true"}],
        RlsRoles.CAS_VIEW_ONLY: [{RlsOperations.SELECT.value: "true"}],
    }

    role_policy_mapping = generate_policy_mapping(
        role_operation_policy_mapping=role_operation_policy_map,
    )

    policies = generate_rls_policies(role_policy_mapping, table)
