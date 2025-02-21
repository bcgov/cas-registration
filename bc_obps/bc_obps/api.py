from typing import Type
from django.http import HttpRequest, HttpResponse
from ninja import NinjaAPI, Swagger
from ninja.errors import ValidationError
from common.api import router as common_router
from registration.api import router as registration_router
from reporting.api import router as reporting_router
from service.error_service.handle_exception import handle_exception

# Docs: https://swagger.io/docs/open-source-tools/swagger-ui/usage/configuration/
# Filtering is case sensitive matching the filter expression anywhere inside the tag.
api = NinjaAPI(
    title="BCIERS API", docs=Swagger(settings={"filter": True, "operationsSorter": "method", "tagsSorter": "alpha"})
)

# This is a custom exception handler for Ninja ValidationError, This helps to return a more detailed error message for Unprocessable Entity (422) responses
@api.exception_handler(ValidationError)
def custom_validation_errors(request: HttpRequest, exc: Type[ValidationError]) -> HttpResponse:
    print(exc.errors)
    return api.create_response(request, {"detail": exc.errors}, status=422)


api.add_exception_handler(Exception, handle_exception)  # Global exception handler

api.add_router("/common/", common_router, tags=["V1"])
api.add_router("/registration/", registration_router, tags=["V1"])
api.add_router("/reporting/", reporting_router, tags=["V1"])
