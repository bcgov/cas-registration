from dataclasses import dataclass
from typing import List, Any, Sequence, Union
from django.db.backends.utils import CursorWrapper
from psycopg.sql import SQL, Composable, Identifier
from common.enums import Schemas
from rls.enums import RlsRoles, RlsOperations


@dataclass(frozen=True)
class ColumnGrant:
    operation: RlsOperations
    columns: List[str]

    def __post_init__(self) -> None:
        if not self.columns:
            raise ValueError("ColumnGrant requires at least one column")

    def to_sql(self) -> Composable:
        return SQL("{operation} ({columns})").format(
            operation=SQL(self.operation.value),
            columns=SQL(", ").join([Identifier(column) for column in self.columns]),
        )


Grant = Union[RlsOperations, ColumnGrant]


def get_grant_operation(grant: Grant) -> RlsOperations:
    return grant.operation if isinstance(grant, ColumnGrant) else grant


class RlsGrant:
    """
    Represents a Role-Level Security (RLS) grant for a specific table and schema.

    Attributes:
        role (str): The database role to grant permissions to.
        grants (Sequence[Grant]): The list of permissions to grant (table-level operations or column-level grants).
        table (str): The table to which the grants apply.
        schema (str): The schema containing the table (default is 'erc').
    """

    def __init__(
        self,
        role: RlsRoles,
        grants: Sequence[Grant],
        table: Any,
        schema: Schemas = Schemas.ERC,
    ):
        self.role = role.value
        self.grants = grants
        self.table = table.value
        self.schema = schema.value

    def apply_grant(self, cursor: CursorWrapper) -> None:
        """
        Applies the grant to the specified table.

        Args:
            cursor (Cursor): The database cursor for executing SQL commands.
        """
        grants = SQL(", ").join(
            [grant.to_sql() if isinstance(grant, ColumnGrant) else SQL(grant.value) for grant in self.grants]
        )
        query = SQL("grant {grants} on {table} to {role}").format(
            grants=grants,
            table=Identifier(self.schema, self.table),
            role=Identifier(self.role),
        )
        try:
            cursor.execute(query)
        except Exception as e:
            raise RuntimeError(f"Failed to apply grant for {self.role} on {self.table}: {e}")
