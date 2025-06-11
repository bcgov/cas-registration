from typing import Any, List, TypedDict
from common.enums import Schemas
from rls.utils.grant import RlsGrant
from rls.utils.policy import RlsPolicy


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
        policies: List[RlsPolicy] = [],
        table: Any = None,
        enable_rls: bool = False,
        schema: Schemas = Schemas.ERC,
    ):
        self.grants = grants
        self.policies = policies
        self.table = table.value if table is not None else None
        self.enable_rls = enable_rls
        self.schema = schema.value


class M2MPolicyStatements(TypedDict):
    using_statement: str
    delete_using_statement: str
