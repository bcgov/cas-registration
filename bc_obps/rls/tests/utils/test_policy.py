from unittest import TestCase
from unittest.mock import patch
from registration.enums.enums import RegistrationTableNames
from registration.models.operation import Operation
from rls.enums import RlsRoles, RlsOperations
from rls.utils.policy import RlsPolicy


class TestRlsPolicy(TestCase):
    @patch('django.db.connection.cursor')
    def test_apply_policy(self, mock_cursor):

        policy = RlsPolicy(
            role=RlsRoles.INDUSTRY_USER,
            policy_name="test_policy",
            operation=RlsOperations.SELECT,
            table=RegistrationTableNames.OPERATION.value,
            using_statement=Operation.Rls.using_statement,
            schema="erc",
        )

        policy.apply_policy(mock_cursor)

        expected_query = "CREATE POLICY test_policy ON erc.operation FOR RlsOperations.SELECT TO industry_user  USING ( \n                    operator_id IN (\n        SELECT uo.operator_id\n        FROM erc.user_operator uo\n        WHERE uo.user_id = current_setting('my.guid', true)::uuid\n          AND uo.status = 'Approved'\n    )\n                     );"

        mock_cursor.execute.assert_called_once_with(expected_query)

    @patch('django.db.connection.cursor')
    def test_apply_policy_failure(self, mock_cursor):
        mock_cursor.execute.side_effect = Exception("SQL error")
        policy = RlsPolicy(
            role=RlsRoles.INDUSTRY_USER,
            policy_name="test_policy",
            operation=RlsOperations.SELECT,
            table=RegistrationTableNames.OPERATION,
            using_statement=Operation.Rls.using_statement,
            schema="erc",
        )

        with self.assertRaises(RuntimeError) as context:
            policy.apply_policy(mock_cursor)

        self.assertIn("Failed to apply policy", str(context.exception))

    @patch('django.db.connection.cursor')
    def test_drop_policy(self, mock_cursor):

        policy = RlsPolicy(
            role=RlsRoles.INDUSTRY_USER,
            policy_name="test_policy",
            operation=RlsOperations.SELECT,
            table=RegistrationTableNames.OPERATION.value,
            using_statement=Operation.Rls.using_statement,
            schema="erc",
        )

        policy.drop_policy(mock_cursor)

        expected_query = 'DROP POLICY IF EXISTS test_policy ON erc.operation  '

        mock_cursor.execute.assert_called_once_with(expected_query)

    @patch('django.db.connection.cursor')
    def test_drop_policy_failure(self, mock_cursor):
        mock_cursor.execute.side_effect = Exception("SQL error")
        policy = RlsPolicy(
            role=RlsRoles.INDUSTRY_USER,
            policy_name="test_policy",
            operation=RlsOperations.SELECT,
            table=RegistrationTableNames.OPERATION,
            using_statement=Operation.Rls.using_statement,
            schema="erc",
        )

        with self.assertRaises(RuntimeError) as context:
            policy.drop_policy(mock_cursor)

        self.assertIn("Failed to drop policy", str(context.exception))
