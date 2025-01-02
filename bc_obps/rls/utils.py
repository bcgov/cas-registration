from typing import List, Optional, Literal
from django.db.backends.utils import CursorWrapper
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
        self, role: RlsRoles, grants: List[RlsOperations], table: str, schema: Literal["erc", "common"] = "erc"
    ):
        self.role = role
        self.grants = grants
        self.table = table
        self.schema = schema

    def apply_grant(self, cursor: CursorWrapper) -> None:
        """
        Applies the grant to the specified table.

        Args:
            cursor (Cursor): The database cursor for executing SQL commands.
        """
        grant_string = ", ".join([grant.value for grant in self.grants])
        execute_string = "GRANT %s ON %s.%s TO %s;"
        try:
            cursor.execute(execute_string, [grant_string, self.schema, self.table, self.role.value])
        except Exception as e:
            raise RuntimeError(f"Failed to apply grant: {execute_string}") from e


class RlsPolicy:
    """
    Represents a Role-Level Security (RLS) policy for a specific table and schema.

    Attributes:
        role (str): The database role affected by the policy.
        policy_name (str): The name of the policy.
        operation (str): The operation type (e.g., 'SELECT', 'INSERT').
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
        execute_string = "CREATE POLICY %s ON %s.%s FOR %s TO %s"
        params = [self.policy_name, self.schema, self.table, self.operation.value, self.role.value]

        if self.using_statement:
            execute_string += " USING (%s)"
            params.append(self.using_statement)
        if self.check_statement:
            execute_string += " WITH CHECK (%s)"
            params.append(self.check_statement)
        execute_string += ";"

        try:
            cursor.execute(execute_string, params)
        except Exception as e:
            raise RuntimeError(f"Failed to apply policy: {execute_string}") from e


class M2mRls:
    """
    Represents many-to-many Role-Level Security (RLS) configurations for a table.

    Attributes:
        enable_rls (bool): Whether RLS is enabled for the table.
        table (str): The table for which RLS is configured.
        grants (List[RlsGrant]): A list of grants to apply.
        policies (List[RlsPolicy]): A list of policies to apply.
        schema (str): The schema containing the table (default is 'erc').
    """

    def __init__(
        self,
        enable_rls: bool,
        table: str,
        grants: List[RlsGrant],
        policies: List[RlsPolicy],
        schema: Literal["erc", "common"] = "erc",
    ):
        self.enable_rls = enable_rls
        self.table = table
        self.grants = grants
        self.policies = policies
        self.schema = schema
