from django.apps import AppConfig


class AuditLogConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'audit_log'

    def ready(self):
        """
        Import signal receivers when the app is ready.
        """
        from .signals import receivers  # noqa: F401
