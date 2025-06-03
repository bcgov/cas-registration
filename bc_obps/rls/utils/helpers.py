from common.enums import Schemas
from typing import Dict, List, Any
from registration.enums.enums import RegistrationTableNames
from rls.enums import RlsRoles, RlsOperations
from rls.utils.grant import RlsGrant
from rls.utils.m2m import M2mRls
from rls.utils.policy import RlsPolicy





def generate_rls_grants(
    role_grants_mapping: Dict[RlsRoles, List[RlsOperations]],
    table: Any,
    schema: Schemas = Schemas.ERC,
) -> List[RlsGrant]:
    """
    Generate a list of RlsGrant objects for a given table based on role-to-grants mapping.
    """
    return [
        RlsGrant(role=role, grants=grants, table=table, schema=schema) for role, grants in role_grants_mapping.items()
    ]

def generate_rls_policies(
    role_grants_mapping: Dict[RlsRoles, List[RlsOperations]],
    table: Any,
    using_statement: str = "FALSE",
    check_statement: str = "FALSE",
    schema: Schemas = Schemas.ERC,
) -> List[RlsGrant]:
    """
    Generate a list of RlsPolicy objects for a given table based on role-to-grants mapping.
    - For SELECT or UPDATE operations: set using_statement
    - For INSERT or UPDATE operations: set check_statement
    - CAS roles always use "TRUE" for those fields; others use the provided arguments
    """
    """
    Generate a list of RlsPolicy objects for a given table based on role-to-grants mapping.
    - For SELECT or UPDATE operations: set using_statement
    - For INSERT or UPDATE operations: set check_statement
    - CAS roles always use "TRUE" for those fields; others use the provided arguments
    """
    cas_roles = {
        RlsRoles.CAS_ADMIN,
        RlsRoles.CAS_ANALYST,
        RlsRoles.CAS_DIRECTOR,
        RlsRoles.CAS_VIEW_ONLY,
    }

    policies = []
    for role, operations in role_grants_mapping.items():
        for operation in operations:
            policy_kwargs = {
                "role": role,
                "policy_name": f"{table.value.lower()}_{role.name.lower()}_{operation.name.lower()}",
                "operation": operation,
                "table": table,
                "schema": schema,
            }

            if operation in [RlsOperations.SELECT, RlsOperations.UPDATE]:
                policy_kwargs["using_statement"] = "TRUE" if role in cas_roles else using_statement

            if operation in [RlsOperations.INSERT, RlsOperations.UPDATE]:
                policy_kwargs["check_statement"] = "TRUE" if role in cas_roles else check_statement

            policies.append(RlsPolicy(**policy_kwargs))

    return policies


def generate_m2m_rls(
    m2m_models_grants_mapping: Dict[Any, Dict[RlsRoles, List[RlsOperations]]],
    schema: Schemas = Schemas.ERC,
) -> List[M2mRls]:
    """
    Generate a list of M2mRls objects based on the M2M table role-to-grants mapping.
    """
    return [
        M2mRls(grants=generate_rls_grants(role_grants_mapping, table, schema))
        for table, role_grants_mapping in m2m_models_grants_mapping.items()
    ]

# def generate_m2m_rls_policies(
#     m2m_models_grants_mapping: Dict[Any, Dict[RlsRoles, List[RlsOperations]]],
#     schema: Schemas = Schemas.ERC,
# ) -> List[M2mRls]:
#     """
#     Generate a list of M2mRls objects based on the M2M table role-to-grants mapping.
#     """
#     # brianna this probably doesn't work
#     return [
#         M2mRls(policies=generate_rls_policies(role_grants_mapping=role_grants_mapping, table=RegistrationTableNames.OPERATION, 
#                                      using_statement="""
#                     id IN (
#                         SELECT operation.id
#                         FROM erc.operation
#                         JOIN erc.user_operator uo
#                         ON operation.operator_id = uo.operator_id
#                         AND uo.user_id = current_setting('my.guid', true)::uuid
#                         AND uo.status = 'Approved'
#                     )
#                     """, check_statement="""
#                     id IN (
#                         SELECT operation.id
#                         FROM erc.operation
#                         JOIN erc.user_operator uo
#                         ON operation.operator_id = uo.operator_id
#                         AND uo.user_id = current_setting('my.guid', true)::uuid
#                         AND uo.status = 'Approved'
#                     )
#                     """))
#         for table, role_grants_mapping in m2m_models_grants_mapping.items()
#     ]
