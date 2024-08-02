from common.permissions import authorize
from typing import List, Literal, Tuple
from django.http import HttpRequest
from registration.constants import FACILITY_TAGS
from registration.models.facility import Facility
from registration.schema.v1.facility import FacilityIn, FacilityOut
from service.facility_service import FacilityService
from registration.api.utils.current_user_utils import get_current_user_guid
from registration.decorators import handle_http_errors
from ..router import router
from service.error_service.custom_codes_4xx import custom_codes_4xx
from registration.schema.generic import Message


##### POST #####


@router.post(
    "/facility",
    response={201: FacilityOut, custom_codes_4xx: Message},
    tags=FACILITY_TAGS,
    description="""Creates a new facility for the current user.""",
    auth=authorize("approved_industry_user"),
)
@handle_http_errors()
def create_facility(request: HttpRequest, payload: FacilityIn) -> Tuple[Literal[201], Facility]:
    return 201, FacilityService.create_facility_with_ownership(get_current_user_guid(request), payload)


@router.post(
    "/facilities",
    response={201: List[FacilityOut], custom_codes_4xx: Message},
    tags=FACILITY_TAGS,
    description="""Creates new facilities from an array for the current user.""",
)
@authorize(["industry_user"], UserOperator.get_all_industry_user_operator_roles())
@handle_http_errors()
def create_facilities(request: HttpRequest, payload: List[FacilityIn]) -> Tuple[Literal[201], List[Facility]]:
    return 201, FacilityService.create_facilities_with_ownership(get_current_user_guid(request), payload)
