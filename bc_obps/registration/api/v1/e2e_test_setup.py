from typing import Optional
from registration.constants import MISC_TAGS
from ..router import router
from django.core.management import call_command
from django.conf import settings
from django.http import HttpRequest, HttpResponse
from django.core.cache import cache


# testing endpoint
@router.get(
    "/test-setup",
    tags=MISC_TAGS,
    description="""Sets up the test environment by either truncating data tables or loading fixtures based on the specified workflow.
    This endpoint is only available in the development environment.""",
)
def setup(
    request: HttpRequest, workflow: Optional[str] = None, truncate_only: bool = False, load_only: bool = False
) -> HttpResponse:
    if settings.ENVIRONMENT == "dev":
        cache.clear()  # clear cache to avoid stale data (specifically for the current_user_middleware.py middleware)
        try:
            if truncate_only:  # only truncate the tables
                call_command('truncate_dev_data_tables')
                return HttpResponse("Test setup complete.", status=200)
            if load_only:  # only load the data
                call_command('load_fixtures', workflow)
                return HttpResponse("Test setup complete.", status=200)
            call_command('truncate_dev_data_tables')
            call_command('load_fixtures', workflow)
            return HttpResponse("Test setup complete.", status=200)
        except Exception as e:
            return HttpResponse(f"Test setup failed. Reason:{e}", status=500)
    else:
        return HttpResponse("This endpoint only exists in the development environment.", status=404)
