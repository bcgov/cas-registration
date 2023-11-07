from ninja import Router
from django.core.management import call_command
from django.conf import settings
from django.http import HttpResponse
router = Router()

# testing endpoint
@router.get("/test-setup")
def setup(request):
    if settings.ENVIRONMENT == "develop":
        try:
            call_command('truncate_all_tables')
            call_command('load_fixtures')
            return HttpResponse("Test setup complete.", status=200)
        except Exception as e:
            return HttpResponse(f"Test setup failed. Reason:{e}", status=500)
    else:
        return HttpResponse("This endpoint only exists in the development environment.", status=404)
