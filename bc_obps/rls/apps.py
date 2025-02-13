from sys import stdout
from django.apps import AppConfig
from django.db.models.signals import post_migrate
from rls.utils.manager import RlsManager
from django.conf import settings


def apply_rls_after_migration(sender, app_config, **kwargs):
    """
    Applying RLS policies after migration
    This is the way to apply the RLS policies after Django migrate command
    """
    if settings.RLS_FLAG is True:
        stdout.write("Applying RLS policies...\n")
        RlsManager.re_apply_rls()


class RlsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'rls'

    def ready(self):
        post_migrate.connect(apply_rls_after_migration, sender=self)
