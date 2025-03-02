from common.permissions import authorize
from typing import List, Literal, Tuple
from django.http import HttpRequest
from registration.constants import FACILITY_TAGS
from registration.models.facility import Facility
from registration.schema import FacilityIn, FacilityOut, Message
from service.facility_service import FacilityService
from common.api.utils import get_current_user_guid
from ..router import router
from service.error_service.custom_codes_4xx import custom_codes_4xx


##### POST #####


@router.post(
    "/facilities",
    response={201: List[FacilityOut], custom_codes_4xx: Message},
    tags=FACILITY_TAGS,
    description="""Creates 1 or more new facilities from an array for the current user.""",
    auth=authorize("approved_industry_user"),
)
def create_facilities(request: HttpRequest, payload: List[FacilityIn]) -> Tuple[Literal[201], List[Facility]]:
    return 201, FacilityService.create_facilities_with_designated_operations(get_current_user_guid(request), payload)
