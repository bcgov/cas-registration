from typing import Dict, Any, Literal, Tuple
from django.http import HttpRequest
from compliance.service.elicensing_service import elicensing_service
from compliance.api.router import router
from common.permissions import authorize


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


@router.get(
    "/elicensing/client/{client_object_id}",
    response={200: Dict[str, Any]},
    tags=["eLicensing"],
    description="Queries a client in the eLicensing system by client object ID",
    auth=authorize("approved_authorized_roles"),
)
def query_client(request: HttpRequest, client_object_id: str) -> Tuple[Literal[200], Dict[str, Any]]:
    """
    Queries a client in the eLicensing system by client object ID.
    
    Args:
        client_object_id: The client object ID in the eLicensing system
    """
    result = elicensing_service.query_client(client_object_id)
    return 200, result 