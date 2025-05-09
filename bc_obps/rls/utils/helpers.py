from common.enums import Schemas
from typing import Dict, List, Any
from rls.enums import RlsRoles, RlsOperations
from rls.utils.grant import RlsGrant
from rls.utils.m2m import M2mRls
from rls.utils.policy import RlsPolicy


# brianna access to their own operator, e.g. statement only
approved_industry_user_statement = """
                    operator_id IN (
                        SELECT o.id
                        FROM erc.operator o
                        JOIN erc.user_operator uo
                        ON o.id = uo.operator_id
                        AND uo.user_id = current_setting('my.guid', true)::uuid
                        AND uo.status = 'Approved'
                    )
                    """



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
    schema: Schemas = Schemas.ERC,
) -> List[RlsGrant]:
    """
    Generate a list of RlsPolicy objects for a given table based on role-to-grants mapping.
    Each policy is defined for a specific role and operation. Using statement defaults to FALSE so that if forgotten, policies won't allow access.
    """
    return [
        RlsPolicy(
            role=role,
            policy_name=f"{table.value.lower()}_{role.name.lower()}_{operation.name.lower()}",
            operation=operation,
            # CAS roles are all or nothing, but industry users need more granularity. In addition to role they have an app_role, and they should only be able to access records belonging to their organization
            using_statement=using_statement if role.name not in [RlsRoles.CAS_ADMIN, RlsRoles.CAS_ANALYST, RlsRoles.CAS_DIRECTOR, RlsRoles.CAS_VIEW_ONLY] else "TRUE",
            table=table,
            schema=schema,
        )
        for role, operations in role_grants_mapping.items()
        for operation in operations
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
