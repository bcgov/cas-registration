from ninja import NinjaAPI
from registration.api import router as registration_router
from ninja.errors import ValidationError
from ninja.renderers import BaseRenderer
import orjson


# orjson benchmarks as the fastest Python library for JSON and is more correct than the standard json library
# DOC:https://github.com/ijl/orjson#performance
class ORJSONRenderer(BaseRenderer):
    media_type = "application/json"

    def render(self, request, data, *, response_status):
        return orjson.dumps(data)


api = NinjaAPI(renderer=ORJSONRenderer())


# print errors for 422 status codes for faster debugging
@api.exception_handler(ValidationError)
def custom_validation_errors(request, exc):
    print(exc.errors)  # This print statement is really helpful for debugging
    return api.create_response(request, {"detail": exc.errors}, status=422)


api.add_router("/registration/", registration_router)
