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
    m2m_models_policy_mapping: Dict[Any, M2MPolicyStatements] = None,
    enable_rls: bool = False,
    schema: Schemas = Schemas.ERC,
) -> List[M2mRls]:
    """
    Generate a list of M2mRls objects based on the M2M table role-to-grants mapping.
    """
    if m2m_models_policy_mapping is None:
        return [
            M2mRls(grants=generate_rls_grants(role_grants_mapping, table, schema))
            for table, role_grants_mapping in m2m_models_grants_mapping.items()
        ]
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


def generate_rls_policies_reg(
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


def generate_rls_policies_rep(
    #roles: List[RlsRoles],
    role_policy_mapping: Dict[RlsRoles, List[Dict[str, str]]],
    #operations: List[RlsOperations],
    table: Any,
    # using_statement: str,
) -> List[RlsPolicy]:
    """
    Generate a list of RlsPolicy objects for a given table based on roles and operation.
    The policies are generated based on the role-to-policy mapping provided.
    Args:
        role_policy_mapping (dict): A mapping of roles to their operations they have been granted and the using/check statements
                                    needed to generate the RLS policies
        table (Any <enum> ): The table for which the policies are being generated. An enum value is expected, such as ReportingTableNames.FACILITY_REPORT.
    Returns:
        List[RlsPolicy]: A list of RlsPolicy objects representing the policies for the specified table.
    """
    policies = []
    for role in role_policy_mapping:
        for el in role_policy_mapping[role]:
            policy = RlsPolicy(
                role=role,
                policy_name=f"{table.value}_{role.value}_{el['operation']}_policy",
                operation=el['operation'],
                table=table.value,
            )
            if el['operation'] in [RlsOperations.SELECT.value, RlsOperations.UPDATE.value, RlsOperations.DELETE.value]:
                policy.using_statement = el['using_statement']
            if el['operation'] in[RlsOperations.UPDATE.value, RlsOperations.INSERT.value]:
                policy.check_statement = el['using_statement']
            policies.append(policy)

    return policies


def generate_report_policy_mapping_from_grants(
    role_grants_mapping: Dict[RlsRoles, List[RlsOperations]],
    using_statement: str, 
    delete_using_statement: str,
) -> Dict[RlsRoles, List[Dict[str, str]]]:
    """
    Generates a mapping of roles to their corresponding policies based on the provided grants and using statements.
    For all internal roles, the using statement is set to 'true', meaning RLS does not filter any rows for those roles.

    The logic in this function is specific to Reporting-related RLS policies.
    The result is consumed by the `generate_rls_policies` function to create RLS policies for Reporting tables.

    Args:
        role_grants_mapping (dict): A dict mapping roles to their respective operations.
        using_statement (str): The SQL using statement (or with check) for RLS policies for SELECT, INSERT, and UPDATE operations for industry users.
        delete_using_statement (str): The SQL using statement for RLS DELETE operations policies for industry users.

    Returns:
        dict: A mapping of roles to their corresponding policies.
    """
    policy_mapping = {}
    for role, operations in role_grants_mapping.items():
        policy_mapping[role] = []
        for operation in operations:
            policy_data = { 'operation': operation.value}
            # If the role is not INDUSTRY_USER, we set the using_statement to 'true'
            # 'true' means RLS does not filter any rows for that role. Only the grants restrict the operations.
            if role != RlsRoles.INDUSTRY_USER:
                policy_data['using_statement'] = 'true'  
            elif operation == RlsOperations.DELETE:
                policy_data['using_statement'] = delete_using_statement
            else:
                policy_data['using_statement'] = using_statement
            policy_mapping[role].append(policy_data)
    return policy_mapping
