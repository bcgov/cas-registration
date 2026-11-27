from typing import Literal

from common.api.utils import get_current_user_guid
from common.permissions import authorize
from common.service.error_service.custom_codes_4xx import custom_codes_4xx
from django.http import HttpRequest
from registration.api.router import router
from registration.constants import FACILITY_TAGS
from registration.models.facility import Facility
from registration.schema import FacilityIn, FacilityOut, Message
from registration.service.facility_service import FacilityService

##### POST #####


@router.post(
    "/facilities",
    response={201: list[FacilityOut], custom_codes_4xx: Message},
    tags=FACILITY_TAGS,
    description="""Creates 1 or more new facilities from an array for the current user.""",
    auth=authorize("approved_industry_user"),
)
def create_facilities(
    request: HttpRequest, payload: list[FacilityIn]
) -> tuple[Literal[201], list[Facility]]:
    return 201, FacilityService.create_facilities_with_designated_operations(
        get_current_user_guid(request), payload
    )
