from django.db.models.signals import pre_migrate
from django.apps import AppConfig
from django.db import connection


def create_erc_schemas(sender, app_config, **kwargs):
    cursor = connection.cursor()
    cursor.execute("CREATE SCHEMA IF NOT EXISTS erc")
    cursor.execute("CREATE SCHEMA IF NOT EXISTS erc_history")


class RegistrationConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "registration"

    def ready(self):
        pre_migrate.connect(create_erc_schemas, sender=self)
        import registration.signals  # noqa: F401
