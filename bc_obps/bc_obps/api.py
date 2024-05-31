from ninja import NinjaAPI
from common.api import router as common_router
from registration.api import router as registration_router

api = NinjaAPI(title="BC OBPS API")

api.add_router("/common/", common_router, tags=["V1"])
api.add_router("/registration/", registration_router, tags=["V1"])
