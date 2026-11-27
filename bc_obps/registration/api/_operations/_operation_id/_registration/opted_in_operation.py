from typing import Literal
from uuid import UUID

from common.api.utils import get_current_user_guid
from common.permissions import authorize
from common.service.error_service.custom_codes_4xx import custom_codes_4xx
from django.http import HttpRequest
from registration.api.router import router
from registration.constants import OPERATION_TAGS
from registration.models.opted_in_operation_detail import OptedInOperationDetail
from registration.schema import (
    Message,
    OptedInOperationDetailIn,
    OptedInOperationDetailOut,
    OptedOutOperationDetailIn,
)
from registration.service.data_types.operation_service import OptedInOperationDetailData
from registration.service.operation_service import OperationService


@router.get(
    "/operations/{uuid:operation_id}/registration/opted-in-operation-detail",
    response={200: OptedInOperationDetailOut, custom_codes_4xx: Message},
    tags=OPERATION_TAGS,
    description="""Get the opted-in operation details of a specific operation by its ID.
    The endpoint ensures that only authorized industry users can update operations belonging to their operator. Unauthorized access attempts raise an error.""",
    auth=authorize("approved_industry_user"),
)
def operation_registration_get_opted_in_operation_detail(
    request: HttpRequest, operation_id: UUID
) -> tuple[Literal[200], OptedInOperationDetail | None]:
    return 200, OperationService.get_opted_in_operation_detail(
        get_current_user_guid(request), operation_id
    )


@router.put(
    "/operations/{uuid:operation_id}/registration/opted-in-operation-detail",
    response={200: OptedInOperationDetailOut, custom_codes_4xx: Message},
    tags=OPERATION_TAGS,
    description="""Updates the opted-in operation details of a specific operation by its ID.
    The endpoint ensures that only authorized industry users can update operations belonging to their operator. Unauthorized access attempts raise an error.""",
    auth=authorize("approved_industry_user"),
)
def operation_registration_update_opted_in_operation_detail(
    request: HttpRequest, operation_id: UUID, payload: OptedInOperationDetailIn
) -> tuple[Literal[200, 400], OptedInOperationDetail]:
    opted_in_operation_detail_data = OptedInOperationDetailData(**payload.dict())
    operation = OperationService.update_opted_in_operation_detail(
        get_current_user_guid(request), operation_id, opted_in_operation_detail_data
    )

    return 200, operation


@router.put(
    "/operations/{uuid:operation_id}/registration/opted-in-operation-detail/final-reporting-year",
    response={200: OptedInOperationDetailOut, custom_codes_4xx: Message},
    tags=OPERATION_TAGS,
    description="""""",
    auth=authorize("cas_director"),
)
def operation_registration_update_final_reporting_year(
    request: HttpRequest, operation_id: UUID, payload: OptedOutOperationDetailIn
) -> tuple[Literal[200, 400], OptedInOperationDetail]:
    return 200, OperationService.update_opted_in_final_reporting_year(
        get_current_user_guid(request), operation_id, payload.final_reporting_year
    )
