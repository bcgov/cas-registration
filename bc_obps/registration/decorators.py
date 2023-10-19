from django.conf import settings
from django.core.exceptions import PermissionDenied


def dev_only_api(view_func):
    def _wrapped_view(request, *args, **kwargs):
        if not settings.DEBUG:
            raise PermissionDenied("This endpoint is only available in development mode.")
        return view_func(request, *args, **kwargs)

    return _wrapped_view
