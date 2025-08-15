import re
import sys
from typing import Optional
import logging
from bc_obps.settings import LOCAL_APPS
from django.core.management.base import BaseCommand
from django.db import connections
from django.db.migrations.loader import MigrationLoader


class Command(BaseCommand):

    help = """
        Checks whether git has any modifications of migration files behind a tag.
        If modifications are found, exit with code 1.
    """

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.logger = logging.getLogger(__name__)

    def add_arguments(self, parser):
        parser.add_argument(
            '--tag',
            type=str,
            required=True,
            help="""
                The tag until which to assess immutability.
                Format: v<major>.<minor>.<patch>.
                The last tag can be retrieved by running `git describe --tags --abbrev=0`.
            """,
        )

        parser.add_argument(
            '--diff',
            type=str,
            required=False,
            help="""
                A list of files impacted by the diff, separated by new_line characters.
                Can be retrived by running `git diff --name-only <somebranch> -- bc_obps/**/migrations`.
                Format: ./bc_obps/someapp/migrations/1234_migratino.py
            """,
        )

    def handle(self, *args, **kwargs) -> None:
        git_tag: str = kwargs['tag']
        diff: Optional[str] = kwargs['diff']

        if not re.match(r'^v\d+\.\d+\.\d+$', git_tag):
            self.stdout.write(self.style.ERROR('Invalid tag format. Use v<major>.<minor>.<patch>.'))
            sys.exit(1)

        if not diff:
            self.stdout.write(
                self.style.WARNING("No changes on migration files - skipping immutable migrations check.")
            )
            return

        # Converting git tag to django tag: v1.2.3 -> V1_2_3
        django_tag = git_tag.replace('v', 'V').replace('.', '_')
        diff_files = diff.splitlines()

        loader = MigrationLoader(connections['default'])
        migrations = loader.disk_migrations

        immutable_migration_errors = {}

        for app in LOCAL_APPS:
            # Find the migration that corresponds to the tag
            tagged_migration = next(
                (
                    migration_name
                    for (app_name, migration_name) in migrations.keys()
                    if app_name == app and migration_name.endswith(django_tag)
                ),
                None,
            )

            # If this app is not part of the tagging system yet
            if tagged_migration is None:
                self.stdout.write(self.style.WARNING(f'No tag was found for {app} app, skipping.'))
                continue

            # Verify that no migration prior to the tagged migration has been changed

            app_path = f'bc_obps/{app}/migrations/'
            edited_app_migrations = [
                diff_file.replace(app_path, '') for diff_file in diff_files if diff_file.startswith(app_path)
            ]

            # # Filter out the release migration itself to avoid false positives
            # # when creating release branches with new tag migrations
            # edited_app_migrations = [
            #     app_migration for app_migration in edited_app_migrations if app_migration != tagged_migration
            # ]

            immutable_files_modified = [
                f'{app_path}{app_migration}'
                for app_migration in edited_app_migrations
                if app_migration < tagged_migration
            ]

            if immutable_files_modified:
                immutable_migration_errors[app] = immutable_files_modified

        if immutable_migration_errors:
            self.stdout.write(self.style.ERROR("Immutable migrations were modified by this branch:"))
            for app, files in immutable_migration_errors.items():
                self.stdout.write(self.style.ERROR(f"App: {app}"))
                for file in files:
                    self.stdout.write(self.style.ERROR(f'  {file}'))
            sys.exit(1)
