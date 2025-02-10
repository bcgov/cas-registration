from unittest import TestCase
from unittest.mock import patch
from psycopg.sql import SQL, Identifier
from common.enums import Schemas
from registration.enums.enums import RegistrationTableNames
from rls.enums import RlsRoles, RlsOperations
from rls.utils.grant import RlsGrant


class TestRlsGrant(TestCase):
    @patch('django.db.connection.cursor')
    def test_apply_grant(self, mock_cursor):
        grant = RlsGrant(
            RlsRoles.INDUSTRY_USER, [RlsOperations.SELECT, RlsOperations.INSERT], RegistrationTableNames.CONTACT
        )

        grant.apply_grant(mock_cursor)

        expected_query = SQL("grant {grants} on {table} to {role}").format(
            grants=SQL("select, insert"),
            table=Identifier(Schemas.ERC.value, RegistrationTableNames.CONTACT.value),
            role=Identifier(RlsRoles.INDUSTRY_USER.value),
        )
        mock_cursor.execute.assert_called_once_with(expected_query)

    @patch('django.db.connection.cursor')
    def test_apply_grant_failure(self, mock_cursor):
        mock_cursor.execute.side_effect = Exception("SQL error")
        grant = RlsGrant(RlsRoles.INDUSTRY_USER, [RlsOperations.SELECT], RegistrationTableNames.CONTACT)

        with self.assertRaises(RuntimeError) as context:
            grant.apply_grant(mock_cursor)

        self.assertIn("Failed to apply grant", str(context.exception))
