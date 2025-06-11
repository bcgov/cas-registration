from unittest import TestCase
from unittest.mock import patch
from registration.enums.enums import RegistrationTableNames
from registration.models.contact import Contact
from rls.enums import RlsRoles, RlsOperations
from rls.utils.policy import RlsPolicy


class TestRlsPolicy(TestCase):
    @patch('django.db.connection.cursor')
    def test_apply_policy(self, mock_cursor):

        policy = RlsPolicy(
            role=RlsRoles.INDUSTRY_USER,
            policy_name="test_policy",
            operation=RlsOperations.SELECT,
            table=RegistrationTableNames.CONTACT.value,
            using_statement=Contact.Rls.using_statement,
            schema="erc",
        )

        policy.apply_policy(mock_cursor)

        expected_query = "CREATE POLICY test_policy ON erc.contact FOR RlsOperations.SELECT TO industry_user  USING ( \n                    operator_id in (\n                        select uo.operator_id\n                        from erc.user_operator uo\n                        where uo.user_id = current_setting('my.guid', true)::uuid\n                        and uo.status = 'Approved'\n                    )\n                     );"

        mock_cursor.execute.assert_called_once_with(expected_query)

    @patch('django.db.connection.cursor')
    def test_apply_policy_failure(self, mock_cursor):
        mock_cursor.execute.side_effect = Exception("SQL error")
        policy = RlsPolicy(
            role=RlsRoles.INDUSTRY_USER,
            policy_name="test_policy",
            operation=RlsOperations.SELECT,
            table=RegistrationTableNames.CONTACT,
            using_statement=Contact.Rls.using_statement,
            schema="erc",
        )

        with self.assertRaises(RuntimeError) as context:
            policy.apply_policy(mock_cursor)

        self.assertIn("Failed to apply policy", str(context.exception))
