from unittest.mock import MagicMock, patch
from django.test import TestCase
from psycopg.sql import Composed, SQL, Literal, Identifier
from rls.management.commands.init_roles import Command


class TestInitRolesCommand(TestCase):
    @patch('rls.management.commands.init_roles.apps.get_model')
    def test_init_roles(self, mock_get_model):
        # Mock the AppRole model
        mock_AppRole = MagicMock()
        mock_AppRole.objects.values_list.return_value = ["role1", "role2"]
        mock_get_model.return_value = mock_AppRole

        # Mock the cursor
        mock_cursor = MagicMock()
        mock_cursor.fetchone.side_effect = [None, (1,)]  # First role doesn't exist, second exists

        # Initialize the command and call init_roles
        command = Command()
        command.init_roles(mock_cursor, ["role1", "role2"])

        # Assertions
        self.assertEqual(mock_cursor.execute.call_count, 4)
        mock_cursor.execute.assert_any_call(
            Composed([SQL('select 1 from pg_roles where rolname = '), Literal('role1')])
        )
        mock_cursor.execute.assert_any_call(Composed([SQL('create role '), Identifier('role1')]))
        mock_cursor.execute.assert_any_call(Composed([SQL('grant usage on schema erc to '), Identifier('role1')]))
        mock_cursor.execute.assert_any_call(
            Composed([SQL('select 1 from pg_roles where rolname = '), Literal('role2')])
        )

    def test_reverse_init_roles(self):
        # Mock the cursor
        mock_cursor = MagicMock()

        # Initialize the command and call reverse_init_roles
        command = Command()
        command.reverse_init_roles(mock_cursor, ["role1", "role2"])

        # Assertions
        mock_cursor.execute.assert_any_call(Composed([SQL('revoke usage on schema erc from '), Identifier('role1')]))
        mock_cursor.execute.assert_any_call(Composed([SQL('drop role '), Identifier('role1')]))
        mock_cursor.execute.assert_any_call(Composed([SQL('revoke usage on schema erc from '), Identifier('role2')]))
        mock_cursor.execute.assert_any_call(Composed([SQL('drop role '), Identifier('role2')]))
