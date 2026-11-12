from unittest import TestCase
from unittest.mock import patch
from reporting.enums.enums import ReportingTableNames
from reporting.models.report import Report
from rls.enums import RlsRoles, RlsOperations
from rls.utils.policy import RlsPolicy


class TestRlsPolicy(TestCase):
    @patch('django.db.connection.cursor')
    def test_apply_policy(self, mock_cursor):

        policy = RlsPolicy(
            role=RlsRoles.INDUSTRY_USER,
            policy_name="test_policy",
            operation=RlsOperations.SELECT,
            table=ReportingTableNames.REPORT.value,
            using_statement=Report.Rls.using_statement,
            schema="erc",
        )

        policy.apply_policy(mock_cursor)

        expected_query = "CREATE POLICY test_policy ON erc.report FOR RlsOperations.SELECT TO industry_user  USING ( \n        exists (\n            with approved_operator as (\n                select operator_id from erc.user_operator where\n                user_id = current_setting('my.guid', true)::uuid\n                and status='Approved'\n            )\n            select 1 from erc.operation_designated_operator_timeline tline\n            join approved_operator ao on ao.operator_id = tline.operator_id\n            and report.operator_id = tline.operator_id\n            and tline.operation_id = report.operation_id\n            and (start_date <= concat(report.reporting_year_id::text, '-12-31')::date and (end_date is null or end_date >= concat(report.reporting_year_id::text, '-12-31')::date))\n        ) );"

        mock_cursor.execute.assert_called_once_with(expected_query)

    @patch('django.db.connection.cursor')
    def test_apply_policy_failure(self, mock_cursor):
        mock_cursor.execute.side_effect = Exception("SQL error")
        policy = RlsPolicy(
            role=RlsRoles.INDUSTRY_USER,
            policy_name="test_policy",
            operation=RlsOperations.SELECT,
            table=ReportingTableNames.REPORT,
            using_statement=Report.Rls.using_statement,
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
            table=ReportingTableNames.REPORT.value,
            using_statement=Report.Rls.using_statement,
            schema="erc",
        )

        policy.drop_policy(mock_cursor)

        expected_query = 'DROP POLICY IF EXISTS test_policy ON erc.report  '

        mock_cursor.execute.assert_called_once_with(expected_query)

    @patch('django.db.connection.cursor')
    def test_drop_policy_failure(self, mock_cursor):
        mock_cursor.execute.side_effect = Exception("SQL error")
        policy = RlsPolicy(
            role=RlsRoles.INDUSTRY_USER,
            policy_name="test_policy",
            operation=RlsOperations.SELECT,
            table=ReportingTableNames.REPORT,
            using_statement=Report.Rls.using_statement,
            schema="erc",
        )

        with self.assertRaises(RuntimeError) as context:
            policy.drop_policy(mock_cursor)

        self.assertIn("Failed to drop policy", str(context.exception))
