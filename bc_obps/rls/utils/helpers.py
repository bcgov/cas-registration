from typing import Dict, List
from registration.enums.enums import RegistrationTableNames
from rls.enums import RlsRoles, RlsOperations
from rls.utils.grant import RlsGrant
from rls.utils.m2m import M2mRls


def generate_rls_grants(
    role_grants_mapping: Dict[RlsRoles, List[RlsOperations]], table: RegistrationTableNames
) -> List[RlsGrant]:
    """
    Generate a list of RlsGrant objects for a given table based on role-to-grants mapping.
    """
    return [RlsGrant(role=role, grants=grants, table=table) for role, grants in role_grants_mapping.items()]


def generate_m2m_rls(
    m2m_models_grants_mapping: Dict[RegistrationTableNames, Dict[RlsRoles, List[RlsOperations]]]
) -> List[M2mRls]:
    """
    Generate a list of M2mRls objects based on the M2M table role-to-grants mapping.
    """
    return [
        M2mRls(grants=generate_rls_grants(role_grants_mapping, table))
        for table, role_grants_mapping in m2m_models_grants_mapping.items()
    ]
