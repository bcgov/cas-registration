import logging
from .router import router
from registration.constants import MISC_TAGS
from django.core.management import call_command
from django.conf import settings
from django.http import HttpRequest, HttpResponse

logger = logging.getLogger(__name__)


@router.get(
    "/create-superuser",
    tags=MISC_TAGS,
    description="""Create a superuser with username and password. This endpoint is only available in the development environment.""",
)
def setup(request: HttpRequest) -> HttpResponse:
    if settings.ENVIRONMENT == "dev":
        try:
            call_command('create_superuser')
            return HttpResponse("Superuser created successfully.", status=200)
        except Exception as e:
            logger.error(f"An error occurred while creating the superuser: {str(e)}")
            return HttpResponse("An error occurred while creating the superuser.")
    else:
        return HttpResponse("This endpoint only exists in the development environment.", status=404)
