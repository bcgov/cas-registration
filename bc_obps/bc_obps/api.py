from ninja import NinjaAPI
from registration.api import router as registration_router
from common_utils.common_utils_base import router as common_utils_router
from ninja.errors import ValidationError

api = NinjaAPI()


# print errors for 422 status codes for faster debugging
@api.exception_handler(ValidationError)
def custom_validation_errors(request, exc):
    print(exc.errors)  # This print statement is really helpful for debugging
    return api.create_response(request, {"detail": exc.errors}, status=422)


api.add_router("/registration/", registration_router)
api.add_router("/common/", common_utils_router)
