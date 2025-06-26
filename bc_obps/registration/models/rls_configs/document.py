from registration.enums.enums import RegistrationTableNames
from rls.enums import RlsRoles, RlsOperations
from rls.utils.helpers import generate_report_policy_mapping_from_grants, generate_rls_grants, generate_rls_policies


class Rls:
    enable_rls = True
    schema = "erc"
    table = RegistrationTableNames.DOCUMENT
    using_statement = (
        """
                     operation_id in
                     (select id
        from erc.operation
        where operator_id in
        (
        select uo.operator_id
        from erc.user_operator uo
        where uo.user_id = current_setting('my.guid', true)::uuid
          and uo.status = 'Approved')
          )

                    """,
    )
    role_grants_mapping = {
        # External users can delete when they change the registration purpose
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
    grants = generate_rls_grants(role_grants_mapping, RegistrationTableNames.DOCUMENT)
    role_policy_mapping = generate_report_policy_mapping_from_grants(
        role_grants_mapping, using_statement, using_statement
    )
    policies = generate_rls_policies(role_policy_mapping, table)
