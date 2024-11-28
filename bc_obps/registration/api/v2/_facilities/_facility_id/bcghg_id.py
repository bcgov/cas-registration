from typing import Literal, Tuple
from uuid import UUID
from django.http import HttpRequest
from registration.models.bc_greenhouse_gas_id import BcGreenhouseGasId
from service.facility_service import FacilityService
from registration.schema.v2.operation import OperationBoroIdOut
from registration.constants import V2
from common.permissions import authorize
from common.api.utils import get_current_user_guid
from service.error_service.custom_codes_4xx import custom_codes_4xx
from registration.decorators import handle_http_errors
from registration.api.router import router
from registration.schema.generic import Message


@router.patch(
    "/v2/facilities/{uuid:facility_id}/bcghg-id",
    response={200: OperationBoroIdOut, custom_codes_4xx: Message},
    tags=V2,
    description="""Generates and returns a BCGHG ID for the facility if the facility doesn't already have a BCGHG ID.""",
    auth=authorize('cas_director'),
)
@handle_http_errors()
def facility_bcghg_id(request: HttpRequest, facility_id: UUID) -> Tuple[Literal[200], BcGreenhouseGasId]:
    return 200, FacilityService.generate_bcghg_id(
        get_current_user_guid(request),
        facility_id,
    )