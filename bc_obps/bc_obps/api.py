from ninja import NinjaAPI
from registration.api import router as registration_router

api = NinjaAPI(title="BC OBPS API")

api.add_router("/registration/", registration_router, tags=["V1"])
