from typing import Literal, Tuple
from uuid import UUID
from django.http import HttpRequest
from registration.constants import FACILITY_TAGS
from registration.schema.v1.facility import FacilityIn
from registration.schema.v1.facility import FacilityOut

from service.facility_service import FacilityService
from common.api.utils import get_current_user_guid

from common.permissions import authorize

from registration.decorators import handle_http_errors

from registration.api.router import router
from registration.models import (
    Facility,
)

from registration.schema.generic import Message
from service.error_service.custom_codes_4xx import custom_codes_4xx


@router.get(
    "/v2/facilities/{uuid:facility_id}",
    response={200: FacilityOut, custom_codes_4xx: Message},
    tags=FACILITY_TAGS,
    description="""Retrieves the details of a specific facility by its ID. The endpoint checks if the current user is authorized to access the facility.
    Industry users can only access facilities that are associated with their own operations. If an unauthorized user attempts to access the facility, an error is raised.""",
    exclude_none=True,  # To exclude None values from the response(used for address fields)
    auth=authorize("approved_authorized_roles"),
)
@handle_http_errors()
def get_facility(request: HttpRequest, facility_id: UUID) -> Tuple[Literal[200], Facility]:
    return 200, FacilityService.get_if_authorized(get_current_user_guid(request), facility_id)


@router.put(
    "/v2/facilities/{uuid:facility_id}",
    response={200: FacilityOut, custom_codes_4xx: Message},
    tags=FACILITY_TAGS,
    description="""
    Updates the details of an existing facility.
    **Raises:**
    - Unauthorized error if the user is not an authorized industry user or lacks access to the facility.
    """,
    auth=authorize("approved_industry_user"),
)
@handle_http_errors()
def update_facility(request: HttpRequest, facility_id: UUID, payload: FacilityIn) -> Tuple[Literal[200], Facility]:
    return 200, FacilityService.update_facility(get_current_user_guid(request), facility_id, payload)
