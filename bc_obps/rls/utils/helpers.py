from rls.utils.policy import RlsPolicy
from common.enums import Schemas
from typing import Dict, List, Any
from rls.enums import RlsRoles, RlsOperations
from rls.utils.grant import RlsGrant
from rls.utils.m2m import M2MPolicyStatements, M2mRls


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


def generate_m2m_rls(
    m2m_models_grants_mapping: Dict[Any, Dict[RlsRoles, List[RlsOperations]]],
    m2m_models_policy_mapping: Dict[Any, M2MPolicyStatements], # TODO: Make this Optional
    enable_rls: bool = False,
    schema: Schemas = Schemas.ERC,
) -> List[M2mRls]:
    """
    Generate a list of M2mRls objects based on the M2M table role-to-grants mapping.
    """
    # Validate that the keys in both dictionaries are identical
    if set(m2m_models_grants_mapping.keys()) != set(m2m_models_policy_mapping.keys()):
        raise ValueError("Keys in m2m_models_grants_mapping and m2m_models_policy_mapping must be identical.")
    return [
        M2mRls(
            grants=generate_rls_grants(role_grants_mapping, table, schema), 
            policies=generate_rls_policies(
                role_policy_mapping=generate_report_policy_mapping_from_grants(
                    role_grants_mapping=role_grants_mapping,
                    using_statement=policy_statements['using_statement'],
                    delete_using_statement=policy_statements['delete_using_statement'],
                ),
                table=table,
            ),
            table=table,
            schema=schema,
            enable_rls=enable_rls,
        )
        for (table, role_grants_mapping),(table, policy_statements) in zip(m2m_models_grants_mapping.items(), m2m_models_policy_mapping.items())
    ]


def generate_rls_policies(
    #roles: List[RlsRoles],
    role_policy_mapping: Dict[RlsRoles, List[Dict[str, str]]],
    #operations: List[RlsOperations],
    table: Any,
    # using_statement: str,
) -> List[RlsPolicy]:
    """
    Generate a list of RlsPolicy objects for a given table based on roles and operation.
    """
    policies = []
    for role in role_policy_mapping:
        for el in role_policy_mapping[role]:
            policy = RlsPolicy(
                role=role,
                policy_name=f"{table.value}_{role.value}_{el['operation']}_policy",
                operation=el['operation'],
                table=table.value,
                using_statement=el['using_statement'],
            )
            if el['operation'] == RlsOperations.INSERT.value:
                policy.check_statement = el['using_statement']
                policy.using_statement = None
            policies.append(policy)

    return policies


def generate_report_policy_mapping_from_grants(
    role_grants_mapping: Dict[RlsRoles, List[RlsOperations]],
    using_statement: str, 
    delete_using_statement: str,
) -> Dict[RlsRoles, List[Dict[str, str]]]:
    """
    Generates a mapping of roles to their corresponding policies based on the provided grants and using statements.

    Args:
        role_grants_mapping (dict): A dictionary mapping roles to their respective operations.
        using_statement (str): The SQL using statement for SELECT operations.
        delete_using_statement (str): The SQL using statement for DELETE operations.

    Returns:
        dict: A mapping of roles to their corresponding policies.
    """
    policy_mapping = {}
    for role, operations in role_grants_mapping.items():
        policy_mapping[role] = []
        for operation in operations:
            policy_data = { 'operation': operation.value}
            if operation == RlsOperations.DELETE:
                policy_data['using_statement'] = delete_using_statement
            else:
                policy_data['using_statement'] = using_statement
            policy_mapping[role].append(policy_data)
    return policy_mapping
