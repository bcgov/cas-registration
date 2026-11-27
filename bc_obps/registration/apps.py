from django.apps import AppConfig
from django.conf import settings
from django.db import connection
from django.db.models.signals import pre_migrate


def create_erc_schemas(sender, app_config, **kwargs):
    cursor = connection.cursor()
    cursor.execute("CREATE SCHEMA IF NOT EXISTS erc")
    cursor.execute("CREATE SCHEMA IF NOT EXISTS erc_history")


class RegistrationConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "registration"

    def ready(self):
        pre_migrate.connect(create_erc_schemas, sender=self)
        from importlib import import_module

        import_module("registration.signals.consumers")
        import_module("registration.signals.signals")

        if settings.ENVIRONMENT != "prod":
            import_module("registration.signals.post_save_fixtures")
