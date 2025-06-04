from registration.enums.enums import RegistrationTableNames
from rls.enums import RlsRoles, RlsOperations
from rls.utils.helpers import generate_rls_grants


class Rls:
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
    # policies = generate_rls_policies(
    #     role_grants_mapping=role_grants_mapping,
    #     table=RegistrationTableNames.OPERATION,
    #     using_statement="""
    #               address.id IN (
    #                     SELECT address.id
    #                     FROM erc.address
    #                     JOIN erc.contact
    #                     ON erc.address.id = contact.address_id
    #                     JOIN erc.user_operator uo
    #                     ON contact.operator_id = uo.operator_id
    #                     AND uo.user_id = current_setting('my.guid', true)::uuid
    #                     AND uo.status = 'Approved'
    #                 )
    #                 """,
    #     check_statement="""
    #                 address.id IN (
    #                     SELECT address.id
    #                     FROM erc.address
    #                     JOIN erc.contact
    #                     ON erc.address.id = contact.address_id
    #                     JOIN erc.user_operator uo
    #                     ON contact.operator_id = uo.operator_id
    #                     AND uo.user_id = current_setting('my.guid', true)::uuid
    #                     AND uo.status = 'Approved'
    #                 )
    #                 """,
    # )
