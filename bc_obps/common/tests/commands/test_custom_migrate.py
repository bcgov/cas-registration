from unittest.mock import patch
from django.test import TestCase
from common.management.commands.custom_migrate import Command


class MigratePredefinedAppsTest(TestCase):

    def setUp(self):
        self.migration_dir = 'path/to/migrations'
        self.fake_files = ['__init__.py', '0001_initial.py', '0002_add_field.py', '0003_remove_field.py', '0004_V1_2_3.py', '0005_add_field.py', '0006_V1_4_5.py', '0007_add_field.py']
        self.cmd = Command()

    @patch('os.listdir')
    def test_get_migration_files_empty_dir(self, mock_listdir):
        # Simulate an empty migration directory
        mock_listdir.return_value = []
        self.assertEqual(self.cmd.get_migration_files(self.migration_dir), [])

    @patch('os.listdir')
    def test_get_migration_files_filters_correctly(self, mock_listdir):
        mock_listdir.return_value = self.fake_files
        migration_files = self.cmd.get_migration_files(self.migration_dir)
        self.assertEqual(len(migration_files), 2)  # Only 2 files match the required format
        self.assertListEqual(migration_files, ['0004_V1_2_3.py', '0006_V1_4_5.py'])

    @patch('os.listdir')
    def test_get_latest_migration_file(self, mock_listdir):
        mock_listdir.return_value = self.fake_files
        migration_files = self.cmd.get_migration_files(self.migration_dir)
        latest_migration = self.cmd.get_latest_migration_file(migration_files)
        self.assertEqual(latest_migration, '0006_V1_4_5.py')
