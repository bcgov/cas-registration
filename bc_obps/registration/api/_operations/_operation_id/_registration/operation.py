from typing import Literal, Tuple
from uuid import UUID
from django.http import HttpRequest
from registration.schema.generic import Message
from service.operation_service import OperationService
from registration.constants import OPERATION_TAGS
from ninja import File, Form, UploadedFile
from registration.schema.operation import (
    OperationRegistrationIn,
    OperationRegistrationInWithDocuments,
    OperationUpdateOut,
    OperationRegistrationOut,
)
from common.permissions import authorize
from common.api.utils import get_current_user_guid
from service.error_service.custom_codes_4xx import custom_codes_4xx
from registration.models import Operation
from registration.api.router import router


##### GET #####
@router.get(
    "/operations/{uuid:operation_id}/registration/operation",
    response={200: OperationRegistrationOut, custom_codes_4xx: Message},
    tags=OPERATION_TAGS,
    description="""Gets the registration purpose, regulated products (if applicable), and select data of a specific operation by its ID.
    The endpoint ensures that only authorized industry users can access operations belonging to their operator. Unauthorized access attempts raise an error.""",
    auth=authorize('approved_industry_user'),
    exclude_none=True,
)
def register_get_operation_information(request: HttpRequest, operation_id: UUID) -> Tuple[Literal[200], Operation]:
    return 200, OperationService.get_if_authorized(get_current_user_guid(request), operation_id)


##### PUT #####
# https://stackoverflow.com/questions/77083771/django-ninja-update-a-filefield
@router.post(
    "/operations/{uuid:operation_id}/registration/operation",
    response={200: OperationUpdateOut, custom_codes_4xx: Message},
    tags=OPERATION_TAGS,
    description="""Updates the registration purpose and regulated products (if applicable) of a specific operation by its ID.
    The endpoint ensures that only authorized industry users can update operations belonging to their operator. Unauthorized access attempts raise an error.""",
    auth=authorize('approved_industry_user'),
)
def register_edit_operation_information(
    request: HttpRequest,
    operation_id: UUID,
    details: Form[OperationRegistrationIn],
    # documents are optional because if the user hasn't given us an updated document, we don't have to do anything
    boundary_map: UploadedFile = File(None),
    process_flow_diagram: UploadedFile = File(None),
) -> Tuple[Literal[200], Operation]:
    payload = OperationRegistrationInWithDocuments(
        **details.dict(by_alias=True),
        **({'boundary_map': boundary_map} if boundary_map else {}),
        **({'process_flow_diagram': process_flow_diagram} if process_flow_diagram else {})
    )
    return 200, OperationService.register_operation_information(get_current_user_guid(request), operation_id, payload)
