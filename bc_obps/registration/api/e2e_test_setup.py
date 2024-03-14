from .api_base import router
from django.core.management import call_command
from django.conf import settings
from django.http import HttpResponse


# testing endpoint
@router.get("/test-setup")
def setup(request, workflow: str = None, truncate_only: bool = False):
    if settings.ENVIRONMENT == "develop":
        try:
            if truncate_only:  # only truncate the tables
                call_command('truncate_dev_data_tables')
                return HttpResponse("Test setup complete.", status=200)

            call_command('truncate_dev_data_tables')
            call_command('load_fixtures', workflow)
            return HttpResponse("Test setup complete.", status=200)
        except Exception as e:
            return HttpResponse(f"Test setup failed. Reason:{e}", status=500)
    else:
        return HttpResponse("This endpoint only exists in the development environment.", status=404)
