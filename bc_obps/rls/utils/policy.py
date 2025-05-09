from typing import Optional, Literal
from django.db.backends.utils import CursorWrapper
from rls.enums import RlsRoles, RlsOperations

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

    REPORT_USING_STATEMENT = """
        report_version_id IN (
            SELECT rv.id
            FROM report_version rv
            JOIN report r ON rv.report_id = r.id
            WHERE r.operator_id IN (
                SELECT uo.operator_id
                FROM user_operator uo
                WHERE uo.user_id = (select current_setting('my.guid', true))
                AND uo.status = 'Approved'
            )
        )
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
        execute_string = (
            f"CREATE POLICY {self.policy_name} ON {self.schema}.{self.table} FOR {self.operation.value} TO {self.role.value} "
        )

        if self.using_statement:
            execute_string += " USING {self.using_statement}"
        if self.check_statement:
            execute_string += " WITH CHECK {self.check_statement}"
        execute_string += ";"

        try:
            cursor.execute(execute_string)
        except Exception as e:
            raise RuntimeError(f"Failed to apply policy: {execute_string}") from e
