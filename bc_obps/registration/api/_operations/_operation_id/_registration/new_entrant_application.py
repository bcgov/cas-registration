from typing import Literal, Tuple
from uuid import UUID
from django.http import HttpRequest
from ninja import File, Form, UploadedFile
from registration.constants import OPERATION_TAGS
from service.error_service.custom_codes_4xx import custom_codes_4xx
from registration.schema.operation import (
    OperationNewEntrantApplicationInWithDocuments,
    OperationUpdateOut,
    OperationNewEntrantApplicationIn,
    OperationNewEntrantApplicationOut,
    Message,
)
from service.operation_service import OperationService
from common.permissions import authorize
from common.api.utils import get_current_user_guid
from registration.models import Operation
from registration.api.router import router


##### GET #####


@router.get(
    "/operations/{uuid:operation_id}/registration/new-entrant-application",
    response={200: OperationNewEntrantApplicationOut, custom_codes_4xx: Message},
    tags=OPERATION_TAGS,
    description="""Retrieves the new entrant application document of a specific operation by its ID. The endpoint checks if the current user is authorized to access the operation.
    Industry users can only access operations they are permitted to view. If an unauthorized user attempts to access the operation, an error is raised.""",
    auth=authorize("approved_authorized_roles"),
    exclude_none=True,  # Exclude None values from the response so that frontend can uses default value for date_of_first_shipment
)
def get_operation_new_entrant_application(request: HttpRequest, operation_id: UUID) -> Tuple[Literal[200], Operation]:
    return 200, OperationService.get_if_authorized(get_current_user_guid(request), operation_id, ['id', 'operator_id'])


@router.post(
    "/operations/{uuid:operation_id}/registration/new-entrant-application",
    response={200: OperationUpdateOut, custom_codes_4xx: Message},
    tags=OPERATION_TAGS,
    description="Creates or replaces a new entrant application document for an Operation",
    auth=authorize("approved_industry_user"),
)
def create_or_replace_new_entrant_application(
    request: HttpRequest,
    operation_id: UUID,
    details: Form[OperationNewEntrantApplicationIn],
    new_entrant_application: UploadedFile = File(None),
) -> Tuple[Literal[200], Operation]:
    payload = OperationNewEntrantApplicationInWithDocuments(
        date_of_first_shipment=details.date_of_first_shipment,
        **({'new_entrant_application': new_entrant_application} if new_entrant_application else {})
    )
    return 200, OperationServiceV2.create_or_replace_new_entrant_application(
        get_current_user_guid(request), operation_id, payload
    )
