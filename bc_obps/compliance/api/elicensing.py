from typing import Dict, Any, Literal, Tuple
from django.http import HttpRequest
from service.elicensing_service import elicensing_service
from compliance.api.router import router


@router.get(
    "/elicensing/test-connection",
    response={200: Dict[str, Any]},
    tags=["eLicensing"],
    description="Tests the connection to the eLicensing API by querying client with ID 174044621",
)
def test_elicensing_connection(request: HttpRequest) -> Tuple[Literal[200], Dict[str, Any]]:
    """
    Tests the connection to the eLicensing API by querying a specific client.
    This endpoint is used to verify that the service can connect to the API and retrieve client data.
    """
    result = elicensing_service.test_connection()
    return 200, result
