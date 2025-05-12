# TODO: Implement the following part when the RlsPolicy class is implemented
from typing import Optional, Literal
from django.db.backends.utils import CursorWrapper
from rls.enums import RlsRoles, RlsOperations
from psycopg.sql import SQL, Identifier


class RlsPolicy:
    """
    Represents a Role-Level Security (RLS) policy for a specific table and schema.

    Attributes:
        role (str): The database role affected by the policy.
        policy_name (str): The name of the policy.
        operation (str): The operation type (e.g., 'select', 'insert').
        table (str): The table the policy applies to.
        using_statement (Optional[str]): The USING clause for the policy (default is None).
        check_statement (Optional[str]): The CHECK clause for the policy (default is None).
        schema (str): The schema containing the table (default is 'erc').
    """

    def __init__(
        self,
        role: RlsRoles,
        policy_name: str,
        operation: RlsOperations,
        table: str,
        using_statement: Optional[str] = None,
        check_statement: Optional[str] = None,
        schema: Literal["erc", "common"] = "erc",
    ):
        self.role = role
        self.policy_name = policy_name
        self.operation = operation
        self.table = table
        self.using_statement = using_statement
        self.check_statement = check_statement
        self.schema = schema

    def apply_policy(self, cursor: CursorWrapper) -> None:
        """
        Creates and applies the policy to the specified table.

        Args:
            cursor (Cursor): The database cursor for executing SQL commands.
        """
        try:
            # brianna this format thing may be unnecessary, chekc
            # Safely create the SQL query
            base_query = SQL("CREATE POLICY {policy} ON {schema}.{table} FOR {operation} TO {role}").format(
                policy=Identifier(self.policy_name),
                schema=Identifier(self.schema.value),
                table=Identifier(self.table.value),
                operation=SQL(self.operation.value),
                role=SQL(self.role.value),
            )

            if self.using_statement:
                base_query += SQL(" USING ({})").format(SQL(self.using_statement))

            if self.check_statement:
                base_query += SQL(" WITH CHECK ({})").format(SQL(self.check_statement))

            base_query += SQL(";")

            # Execute the query
            cursor.execute(base_query)

        except Exception as e:
            # Handle exception and print out query for debugging
            raise RuntimeError(f"Failed to apply policy: {base_query.as_string(cursor.cursor)}") from e
