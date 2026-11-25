from dataclasses import dataclass


@dataclass
class UserLoginSyncData:
    """
    Identity-provider-owned fields (from the Keycloak/BCeID profile) that are refreshed on every login
    """

    email: str
    bceid_business_name: str
