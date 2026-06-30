from typing import Literal, Tuple
from uuid import UUID
from django.http import HttpRequest
from ninja import File, UploadedFile
from registration.schema import OperationInformationIn, OperationUpdateOut, OperationRegistrationOut, Message
from service.operation_service import OperationData, OperationService
from registration.constants import OPERATION_TAGS
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
    payload: OperationInformationIn,
    # django-ninja doesn't parse multipart requests properly if the type is marked Optional
    boundary_map: File[UploadedFile] = None,  # type: ignore
    process_flow_diagram: File[UploadedFile] = None,  # type: ignore
    new_entrant_application: File[UploadedFile] = None,  # type: ignore
) -> Tuple[Literal[200], Operation]:

    data = OperationData(
        boundary_map=boundary_map,
        process_flow_diagram=process_flow_diagram,
        new_entrant_application=new_entrant_application,
        **payload.model_dump(),
    )
    operation = OperationService.register_operation_information(get_current_user_guid(request), operation_id, data)

    return 200, operation
