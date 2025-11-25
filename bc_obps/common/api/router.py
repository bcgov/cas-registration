from ninja import Router
from common.api.test_errors import router as test_errors_router

router = Router()
router.add_router("/", test_errors_router)
