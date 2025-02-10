from ninja.responses import Response
from .router import router

@router.get("/health")
def health_check() -> Response:
    """Health check endpoint for compliance API"""
    return Response({"status": "ok"}) 