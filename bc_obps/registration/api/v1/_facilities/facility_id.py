from typing import Literal, Tuple
from uuid import UUID
from django.http import HttpRequest
from registration.constants import FACILITY_TAGS
from registration.models.app_role import AppRole
from registration.models.user_operator import UserOperator
from registration.schema.v1.facility import FacilityIn
from registration.schema.v1.facility import FacilityOut

from service.facility_service import FacilityService
from registration.api.utils.current_user_utils import get_current_user_guid


from registration.decorators import authorize, handle_http_errors

from registration.api.router import router
from registration.models import (
    Facility,
)

from registration.schema.generic import Message
from service.error_service.custom_codes_4xx import custom_codes_4xx


@router.get(
    "/facilities/{facility_id}",
    response={200: FacilityOut, custom_codes_4xx: Message},
    tags=FACILITY_TAGS,
    description="""Retrieves the details of a specific facility by its ID. The endpoint checks if the current user is authorized to access the facility.
    Industry users can only access facilities that are associated with their own operations. If an unauthorized user attempts to access the facility, an error is raised.""",
    exclude_none=True,  # To exclude None values from the response(used for address fields)
)
@authorize(AppRole.get_all_authorized_app_roles(), UserOperator.get_all_industry_user_operator_roles())
@handle_http_errors()
def get_facility(request: HttpRequest, facility_id: UUID) -> Tuple[Literal[200], Facility]:
    return 200, FacilityService.get_if_authorized(get_current_user_guid(request), facility_id)


@router.put(
    "/facilities/{facility_id}",
    response={200: FacilityOut, custom_codes_4xx: Message},
    tags=FACILITY_TAGS,
    description="""
    Updates the details of an existing facility.

    **Requires:**
    - Authorized industry user with access to the specified facility.

    **Parameters:**
    - **facility_id** (UUID): The unique identifier of the facility to be updated.
    - **payload** (FacilityIn): A JSON object containing the new facility data, FacilityIn schema.

    **Returns:**
    - **200:** The updated facility data (FacilityOut) if successful.
    - **4xx:** Custom error codes and messages indicating the failure reason.

    **Raises:**
    - Unauthorized error if the user is not an authorized industry user or lacks access to the facility.

    """
)
@authorize(["industry_user"], UserOperator.get_all_industry_user_operator_roles())
@handle_http_errors()
def update_facility(
    request: HttpRequest, facility_id: UUID, payload: FacilityIn
) -> Tuple[Literal[200], Facility]:
    return 200, FacilityService.update_facility(
        get_current_user_guid(request), facility_id, payload
    )
