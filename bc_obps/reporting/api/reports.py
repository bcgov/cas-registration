from registration.decorators import handle_http_errors
from .router import router


@router.post(
    "/reports/",
)
@handle_http_errors()
def create_report() -> int:
    return 200
