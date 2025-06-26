from registration.enums.enums import RegistrationTableNames
from rls.enums import RlsRoles, RlsOperations
from rls.utils.helpers import generate_report_policy_mapping_from_grants, generate_rls_grants, generate_rls_policies

# brianna do we need to do RLS for address? Confidential?

class Rls:
    # enable_rls = True
    schema = "erc"
    table = RegistrationTableNames.ADDRESS
    using_statement="""
                id IN (
                select contact.address_id
    FROM erc.contact
    where contact.operator_id IN (
    SELECT uo.operator_id
    FROM erc.user_operator uo
    WHERE uo.user_id = current_setting('my.guid', true)::uuid
        AND uo.status = 'Approved'
))
                """,
    role_grants_mapping = {
        # External users can delete when they update their address when updating Contact or Facility Information or ...
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
    grants = generate_rls_grants(role_grants_mapping, RegistrationTableNames.ADDRESS)
    role_policy_mapping = generate_report_policy_mapping_from_grants(
    role_grants_mapping, using_statement, using_statement
    )
    policies = generate_rls_policies(role_policy_mapping, table)
