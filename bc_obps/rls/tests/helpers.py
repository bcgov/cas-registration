from django.apps import apps
from django.conf import settings


def get_models_for_rls(app_name=None):
    local_apps_tuple = tuple(settings.LOCAL_APPS)
    return [
        model
        for model in apps.get_models()
        # modules that don't have `models` in their path are excluded
        # These modules are for historical data models, and we don't need to apply RLS on them
        if model.__module__.startswith(app_name if app_name else local_apps_tuple) and ".models." in model.__module__
    ]
