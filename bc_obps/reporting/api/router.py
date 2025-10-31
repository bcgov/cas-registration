from ninja import Router
from .v2 import router as router_v2

router = Router()

router.add_router('v2', router_v2)
