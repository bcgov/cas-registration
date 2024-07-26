from typing import Literal, Tuple
from uuid import UUID
from django.http import HttpRequest
from registration.constants import FACILITY_TAGS
from registration.models.app_role import AppRole
from registration.models.user_operator import UserOperator
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
