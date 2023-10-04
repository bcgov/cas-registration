from ninja import NinjaAPI
from registration.api import router as registration_router

api = NinjaAPI()

api.add_router("/registration/", registration_router)
