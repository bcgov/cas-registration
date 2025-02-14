import unittest
from unittest import TestCase
from unittest.mock import patch, MagicMock
from django.conf import settings
from psycopg.sql import Composed, SQL, Identifier
from rls.utils.manager import RlsManager


@unittest.skipIf(not settings.RLS_FLAG, "RLS implementation")
class TestRlsManager(TestCase):
    @patch('django.db.connection.cursor')
    def test_revoke_all_privileges(self, mock_cursor):
        mock_cursor_instance = mock_cursor.return_value.__enter__.return_value
        RlsManager.revoke_all_privileges()

        # Ensure SQL execution calls are made
        self.assertEqual(mock_cursor_instance.execute.call_count, 14)

        # Check the correct SQL commands are executed
        mock_cursor_instance.execute.assert_any_call(
            Composed(
                [
                    SQL('drop owned by '),
                    Composed(
                        [
                            Identifier('industry_user'),
                            SQL(', '),
                            Identifier('cas_director'),
                            SQL(', '),
                            Identifier('cas_admin'),
                            SQL(', '),
                            Identifier('cas_analyst'),
                            SQL(', '),
                            Identifier('cas_pending'),
                            SQL(', '),
                            Identifier('cas_view_only'),
                        ]
                    ),
                ]
            )
        )
        mock_cursor_instance.execute.assert_any_call(
            Composed(
                [
                    SQL('grant usage on schema erc to '),
                    Composed(
                        [
                            Identifier('industry_user'),
                            SQL(', '),
                            Identifier('cas_director'),
                            SQL(', '),
                            Identifier('cas_admin'),
                            SQL(', '),
                            Identifier('cas_analyst'),
                            SQL(', '),
                            Identifier('cas_pending'),
                            SQL(', '),
                            Identifier('cas_view_only'),
                        ]
                    ),
                ]
            )
        )
        mock_cursor_instance.execute.assert_any_call("grant usage on schema erc_history to public")
        mock_cursor_instance.execute.assert_any_call(
            "grant all privileges on all tables in schema erc_history to public"
        )
        mock_cursor_instance.execute.assert_any_call("grant usage on schema common to public")
        mock_cursor_instance.execute.assert_any_call("grant select on all tables in schema common to public")

        # Tables and sequences that need to be granted INSERT and UPDATE privileges
        # These are the tables that have historical records for m2m relationships
        # At the time of writing this, there is no way to specify the schema for these tables in Django model field
        tables_and_sequences = [
            'registration_historicalfacility_well_authorization_numbers',
            'registration_historicalfacility_well_authori_m2m_history_id_seq',
            'registration_historicaloperation_contacts',
            'registration_historicaloperation_contacts_m2m_history_id_seq',
            'registration_historicaloperation_activities',
            'registration_historicaloperation_activities_m2m_history_id_seq',
            'registration_historicaloperation_regulated_products',
            'registration_historicaloperation_regulated_p_m2m_history_id_seq',
        ]
        for item in tables_and_sequences:
            mock_cursor_instance.execute.assert_any_call(
                SQL("grant insert, update, select on public.{} to public;").format(Identifier(item))
            )

    @patch('rls.utils.manager.settings')
    @patch('rls.utils.manager.apps.all_models')
    @patch.object(RlsManager, 'apply_rls_for_model')
    def test_apply_rls(self, mock_apply_rls_for_model, mock_all_models, mock_settings):
        mock_settings.LOCAL_APPS = ['app1', 'app2']
        mock_all_models.__getitem__.side_effect = (
            lambda app_name: {'contact': MagicMock()} if app_name == 'app1' else {}
        )
        RlsManager.apply_rls()

        # Ensure apply_rls_for_model is called for eligible models
        mock_apply_rls_for_model.assert_called_once_with('app1', 'contact')

    @patch(
        'django.apps.apps.all_models', new_callable=lambda: {'app1': {'contact': MagicMock(Rls=MagicMock(grants=[]))}}
    )
    @patch('django.db.connection.cursor')
    def test_apply_rls_for_model(self, mock_cursor, mock_all_models):
        mock_cursor_instance = mock_cursor.return_value.__enter__.return_value
        RlsManager.apply_rls_for_model('app1', 'contact')

        # Ensure no grants were executed since the list is empty
        mock_cursor_instance.execute.assert_not_called()

    @patch.object(RlsManager, 'revoke_all_privileges')
    @patch.object(RlsManager, 'apply_rls')
    def test_re_apply_rls(self, mock_apply_rls, mock_revoke_all_privileges):
        RlsManager.re_apply_rls()

        # Ensure methods are called in order
        mock_revoke_all_privileges.assert_called_once()
        mock_apply_rls.assert_called_once()
