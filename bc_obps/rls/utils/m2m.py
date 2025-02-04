from typing import List
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
        schema: Schemas = Schemas.ERC,
        # TODO: Implement the following part when the RlsPolicy class is implemented
        # policies: List[RlsPolicy],
    ):
        self.grants = grants
        self.schema = schema
        # TODO: Implement the following part when the RlsPolicy class is implemented
        # self.policies = policies
