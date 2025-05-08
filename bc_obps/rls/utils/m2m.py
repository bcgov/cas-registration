from typing import List
from rls.utils.policy import RlsPolicy
from common.enums import Schemas
from rls.utils.grant import RlsGrant


class M2mRls:
    """
    Represents many-to-many Role-Level Security (RLS) configurations for a table.

    Attributes:
        grants (List[RlsGrant]): A list of grants to apply.
        schema (str): The schema containing the table (default is 'erc').
        policies (List[RlsPolicy]): A list of policies to apply.
    """

    def __init__(
        self,
        grants: List[RlsGrant],
        policies: List[RlsPolicy],
        schema: Schemas = Schemas.ERC,
    ):
        self.grants = grants
        self.policies = policies
        self.schema = schema
