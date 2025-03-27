from unittest import TestCase
from unittest.mock import patch, MagicMock
from psycopg.sql import Composed, SQL, Identifier
from rls.utils.manager import RlsManager


class TestRlsManager(TestCase):
    @classmethod
    def _get_composed_role_identifiers(cls):
        return Composed(
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
        )

    @patch('django.db.connection.cursor')
    def test_reset_privileges_for_roles(self, mock_cursor):
        mock_cursor_instance = mock_cursor.return_value.__enter__.return_value
        RlsManager.reset_privileges_for_roles()

        # Ensure SQL execution calls are made
        self.assertEqual(mock_cursor_instance.execute.call_count, 16)

        # Check the correct SQL commands are executed
        mock_cursor_instance.execute.assert_any_call(
            Composed(
                [
                    SQL('revoke all privileges on all tables in schema erc from '),
                    self._get_composed_role_identifiers(),
                ]
            )
        )
        mock_cursor_instance.execute.assert_any_call(
            Composed(
                [
                    SQL('grant usage on schema erc to '),
                    self._get_composed_role_identifiers(),
                ]
            )
        )
        mock_cursor_instance.execute.assert_any_call(
            Composed(
                [
                    SQL('grant usage on schema erc_history to '),
                    self._get_composed_role_identifiers(),
                ]
            )
        )
        mock_cursor_instance.execute.assert_any_call(
            Composed(
                [
                    SQL('grant usage on schema public to '),
                    self._get_composed_role_identifiers(),
                ]
            )
        )
        mock_cursor_instance.execute.assert_any_call(
            Composed(
                [
                    SQL('grant usage on schema common to '),
                    self._get_composed_role_identifiers(),
                ]
            )
        )
        mock_cursor_instance.execute.assert_any_call(
            Composed(
                [
                    SQL('grant select, insert on all tables in schema common to '),
                    self._get_composed_role_identifiers(),
                ]
            )
        )
        mock_cursor_instance.execute.assert_any_call(
            Composed(
                [
                    SQL('grant select on public.django_content_type to '),
                    self._get_composed_role_identifiers(),
                ]
            )
        )

        # Tables and sequences that need to be granted INSERT and UPDATE privileges
        # These are the tables that have historical records for m2m relationships
        # At the time of writing this, there is no way to specify the schema for these tables in Django model field
        tables = [
            'registration_historicalfacility_well_authorization_numbers',
            'registration_historicaloperation_contacts',
            'registration_historicaloperation_activities',
            'registration_historicaloperation_regulated_products',
        ]
        for table in tables:
            mock_cursor_instance.execute.assert_any_call(
                SQL("grant select, insert, update on public.{} to {};").format(
                    Identifier(table), self._get_composed_role_identifiers()
                )
            )
        sequences = [
            'registration_historicalfacility_well_authori_m2m_history_id_seq',
            'registration_historicaloperation_contacts_m2m_history_id_seq',
            'registration_historicaloperation_activities_m2m_history_id_seq',
            'registration_historicaloperation_regulated_p_m2m_history_id_seq',
        ]
        for sequence in sequences:
            mock_cursor_instance.execute.assert_any_call(
                SQL("grant usage, select, update on sequence public.{} to {};").format(
                    Identifier(sequence), self._get_composed_role_identifiers()
                )
            )

    @patch('rls.utils.manager.settings')
    @patch('rls.utils.manager.apps.all_models')
    @patch.object(RlsManager, 'apply_rls_for_model')
    def test_apply_rls(self, mock_apply_rls_for_model, mock_all_models, mock_settings):
        mock_settings.RLS_GRANT_APPS = ['app1', 'app2']
        mock_all_models.__getitem__.side_effect = lambda app_name: (
            {'contact': MagicMock()} if app_name == 'app1' else {}
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

    @patch.object(RlsManager, 'reset_privileges_for_roles')
    @patch.object(RlsManager, 'apply_rls')
    def test_re_apply_rls(self, mock_apply_rls, mock_reset_privileges_for_roles):
        RlsManager.re_apply_rls()

        # Ensure methods are called in order
        mock_reset_privileges_for_roles.assert_called_once()
        mock_apply_rls.assert_called_once()
