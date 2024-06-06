from ninja import NinjaAPI, Swagger
from common.api import router as common_router
from registration.api import router as registration_router
from reporting.api import router as reporting_router

# Docs: https://swagger.io/docs/open-source-tools/swagger-ui/usage/configuration/
# Filtering is case sensitive matching the filter expression anywhere inside the tag.
api = NinjaAPI(
    title="BCIERS API", docs=Swagger(settings={"filter": True, "operationsSorter": "method", "tagsSorter": "alpha"})
)

api.add_router("/common/", common_router, tags=["V1"])
api.add_router("/registration/", registration_router, tags=["V1"])
api.add_router("/reporting/", reporting_router, tags=["V1"])
