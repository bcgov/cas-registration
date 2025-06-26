from registration.enums.enums import RegistrationTableNames
from rls.enums import RlsRoles, RlsOperations
from rls.utils.helpers import generate_rls_grants, generate_rls_policies


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
    policies = generate_rls_policies(
        role_grants_mapping=role_grants_mapping,
        table=RegistrationTableNames.USER_OPERATOR,
        using_statement="""
status = 'Approved'
""",
        check_statement="""
       status = 'Approved'


                    """,
    )
