from typing import Literal, Tuple
from uuid import UUID
from registration.schema import OperationInformationInUpdate, OperationOutV2, OperationOutWithDocuments, Message
from registration.schema.operation import (
    OperationAdminstrationIn,
    OperationRegistrationInWithDocuments,
    OperationAdministrationOut,
)
from common.permissions import authorize
from django.http import HttpRequest
from registration.constants import OPERATION_TAGS
from service.error_service.custom_codes_4xx import custom_codes_4xx
from service.operation_service import OperationService
from common.api.utils import get_current_user_guid
from registration.api.router import router
from registration.models import Operation
from registration.schema.generic import Message
from ninja import File, Form, UploadedFile


##### GET #####


@router.get(
    "/operations/{uuid:operation_id}",
    response={200: OperationAdministrationOut, custom_codes_4xx: Message},
    tags=OPERATION_TAGS,
    description="""Retrieves the details of a specific operation by its ID. Unlike the v1 endpoint, this endpoint does not
    return the new entrant application field as it can be quite large and cause slow requests. If you need the new entrant application field,
    use the  operations/{operation_id}/registration/new-entrant-application endpoint or v1 of this endpoint""",
    exclude_none=True,
    auth=authorize("approved_authorized_roles"),
)
def get_operation(request: HttpRequest, operation_id: UUID) -> Tuple[Literal[200], Operation]:
    return 200, OperationService.get_if_authorized(get_current_user_guid(request), operation_id)


@router.get(
    "/operations/{uuid:operation_id}/with-documents",
    response={200: OperationAdministrationOut, custom_codes_4xx: Message},
    tags=OPERATION_TAGS,
    description="""Retrieves the details of a specific operation by its ID along with it's documents""",
    exclude_none=True,
    auth=authorize("approved_authorized_roles"),
)
def get_operation_with_documents(request: HttpRequest, operation_id: UUID) -> Tuple[Literal[200], Operation]:
    return 200, OperationService.get_if_authorized(get_current_user_guid(request), operation_id)


##### PUT ######


@router.post(
    "/operations/{uuid:operation_id}",
    response={200: OperationAdministrationOut, custom_codes_4xx: Message},
    tags=OPERATION_TAGS,
    description="Updates the details of a specific operation by its ID.",
    auth=authorize("approved_industry_user"),
)
def update_operation(
    request: HttpRequest,
    operation_id: UUID,
    details: Form[OperationAdminstrationIn],
    # documents are optional because if the user hasn't given us an updated document, we don't do anything
    boundary_map: UploadedFile = File(None),
    process_flow_diagram: UploadedFile = File(None),
    new_entrant_application: UploadedFile = File(None),
) -> Tuple[Literal[200], Operation]:
    payload = OperationRegistrationInWithDocuments(
        **details.dict(by_alias=True),
        **({'boundary_map': boundary_map} if boundary_map else {}),
        **({'process_flow_diagram': process_flow_diagram} if process_flow_diagram else {}),
        **({'new_entrant_application': new_entrant_application} if new_entrant_application else {})
    )
    return 200, OperationService.update_operation(get_current_user_guid(request), payload, operation_id)
