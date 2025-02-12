from typing import List
from django.db.backends.utils import CursorWrapper
from psycopg.sql import SQL, Identifier
from common.enums import Schemas
from registration.enums.enums import RegistrationTableNames
from rls.enums import RlsRoles, RlsOperations


class RlsGrant:
    """
    Represents a Role-Level Security (RLS) grant for a specific table and schema.

    Attributes:
        role (str): The database role to grant permissions to.
        grants (List[str]): The list of permissions to grant.
        table (str): The table to which the grants apply.
        schema (str): The schema containing the table (default is 'erc').
    """

    def __init__(
        self, role: RlsRoles, grants: List[RlsOperations], table: RegistrationTableNames, schema: Schemas = Schemas.ERC
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
        grant_string = ", ".join([grant.value for grant in self.grants])
        query = SQL("grant {grants} on {table} to {role}").format(
            grants=SQL(grant_string),
            table=Identifier(self.schema, self.table),
            role=Identifier(self.role),
        )
        try:
            cursor.execute(query)
        except Exception as e:
            raise RuntimeError(f"Failed to apply grant for {self.role} on {self.table}: {e}")
