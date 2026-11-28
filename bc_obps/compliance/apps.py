from django.apps import AppConfig


class ComplianceConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "compliance"

    def ready(self):
        """
        Import signals when the app is ready.
        """
        from importlib import import_module

        import_module("compliance.signals.signals")
        import_module("compliance.signals.consumers")
