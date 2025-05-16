from rls.utils.policy import RlsPolicy
from reporting.enums.enums import ReportingTableNames
from common.enums import Schemas
from typing import Dict, List, Any
from rls.enums import RlsRoles, RlsOperations
from rls.utils.grant import RlsGrant
from rls.utils.m2m import M2mRls


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
    schema: Schemas = Schemas.ERC,
) -> List[M2mRls]:
    """
    Generate a list of M2mRls objects based on the M2M table role-to-grants mapping.
    """
    return [
        M2mRls(grants=generate_rls_grants(role_grants_mapping, table, schema))
        for table, role_grants_mapping in m2m_models_grants_mapping.items()
    ]

def generate_report_related_industry_user_rls_policies(
    operations: List[RlsOperations],
    table: str,
    using_statement: str,
) -> List[RlsPolicy]:
    """
    Generate RLS policies for the INDUSTRY_USER role based on the operations and table.
    """
    policies = []
    for operation in operations:
        if operation == RlsOperations.DELETE and table == ReportingTableNames.REPORT.value:
            continue
        policy = RlsPolicy(
                role=RlsRoles.INDUSTRY_USER,
                policy_name=f"{table}_industry_{operation.value}_policy",
                operation=operation.value,
                table=table,
                using_statement=using_statement,
            )
        if operation == RlsOperations.INSERT:
            policy.check_statement = using_statement
            policy.using_statement = None
        # Only report_versions with status 'Draft' should be able to be deleted
        if operation == RlsOperations.DELETE:
            delete_using_statement = using_statement.replace(
                "AND uo.status = 'Approved'",
                "AND uo.status = 'Approved' AND rv.status = 'Draft'",
            )
            policy.using_statement = delete_using_statement
        policies.append(policy)
    return policies


def generate_rls_policies(
    #roles: List[RlsRoles],
    role_policy_mapping: Dict[RlsRoles, List[Dict[str, str]]],
    #operations: List[RlsOperations],
    table: str,
    # using_statement: str,
) -> List[RlsPolicy]:
    """
    Generate a list of RlsPolicy objects for a given table based on roles and operation.
    This function assumes that for all internal roles (not INDUSTRY_USER), RLS should not block operations.
    """
    policies = []
    # for role, grants in role_grants_mapping.items():
    #     if role == RlsRoles.INDUSTRY_USER:
    #         continue
    #     for operation in grants:
    #         policies.append(
    #             RlsPolicy(
    #                 role=role,
    #                 policy_name=f"{table}_{role.value}_{operation.value}_policy",
    #                 operation=operation,
    #                 table=table,
    #                 using_statement=using_statement,
    #             )
    #         )
    for role in role_policy_mapping:
        for el in role_policy_mapping[role]:
            policy = RlsPolicy(
                role=role,
                policy_name=f"{table}_{role.value}_{el['operation']}_policy",
                operation=el['operation'],
                table=table,
                using_statement=el['using_statement'],
            )
            if el['operation'] == RlsOperations.INSERT.value:
                policy.check_statement = el['using_statement']
                policy.using_statement = None
            policies.append(policy)


    # for role in roles:
    #     if role == RlsRoles.INDUSTRY_USER:
    #         policies.extend(generate_report_related_industry_user_rls_policies(operations, table, using_statement))
    #         continue
    #     policies.append(
    #         RlsPolicy(
    #             role=role,
    #             policy_name=f"{table}_{role.value}_all_operations_policy",
    #             operation="ALL",
    #             table=table,
    #             using_statement='true',
    #         )
    #     )
    return policies


def generate_report_policy_mapping_from_grants(role_grants_mapping, using_statement, delete_using_statement) -> Dict[RlsRoles, List[Dict[str, str]]]:
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
