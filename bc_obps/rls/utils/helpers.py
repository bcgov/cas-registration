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
