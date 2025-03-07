from django.apps import AppConfig


class EventsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'events'
    verbose_name = 'Application Events'

    def ready(self):
        """
        Import signals when the app is ready.
        """
        # Import signals module to register handlers
        pass
