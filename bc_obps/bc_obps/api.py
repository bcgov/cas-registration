from ninja import NinjaAPI
from registration.api import router as registration_router
from ninja.errors import ValidationError

api = NinjaAPI()


@api.exception_handler(ValidationError)
def custom_validation_errors(request, exc):
    print(exc.errors)  # <--------------------- !!!!
    return api.create_response(request, {"detail": exc.errors}, status=422)


api.add_router("/registration/", registration_router)


@api.get("/add")
def add(request, a: int, b: int):
    return {"result": a + b}
