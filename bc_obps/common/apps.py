from django.db.models.signals import pre_migrate
from django.apps import AppConfig
from django.db import connection


def create_common_schema(sender, app_config, **kwargs):
    cursor = connection.cursor()
    cursor.execute("CREATE SCHEMA IF NOT EXISTS common")


class CommonConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'common'

    def ready(self):
        pre_migrate.connect(create_common_schema, sender=self)
        from . import signals  # noqa: F401
