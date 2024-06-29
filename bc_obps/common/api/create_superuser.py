from .router import router
from registration.constants import MISC_TAGS
from django.core.management import call_command
from django.conf import settings
from django.http import HttpRequest, HttpResponse


@router.get(
    "/create-superuser",
    tags=MISC_TAGS,
    description="""Create a superuser with username and password. This endpoint is only available in the development environment.""",
)
def setup(request: HttpRequest) -> HttpResponse:
    if settings.ENVIRONMENT == "develop":
        try:
            call_command('create_superuser')
            return HttpResponse("Superuser created successfully.", status=200)
        except Exception as e:
            return HttpResponse(f"An error occurred while creating the superuser: {str(e)}", status=500)
    else:
        return HttpResponse("This endpoint only exists in the development environment.", status=404)
