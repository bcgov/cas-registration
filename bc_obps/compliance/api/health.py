from ninja.responses import Response
from django.http import HttpRequest
from .router import router

@router.get("/health")
def health_check(request: HttpRequest) -> Response:
    """Health check endpoint for compliance API"""
    return Response({"status": "ok"}) 