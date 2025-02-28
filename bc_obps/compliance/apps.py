from django.apps import AppConfig


class ComplianceConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'compliance'

    def ready(self):
        """
        Import signals when the app is ready.
        """
        from . import signals  # noqa: F401
