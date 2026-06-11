from typing import List, Literal, Optional, Tuple
from uuid import UUID
from ninja import Field, File, Form, ModelSchema, Schema, UploadedFile
from registration.schema import OperationInformationInUpdate, OperationOut, OperationOutWithDocuments, Message
from common.permissions import authorize
from django.http import HttpRequest
from registration.constants import OPERATION_TAGS
from registration.schema.multiple_operator import MultipleOperatorIn
from service.error_service.custom_codes_4xx import custom_codes_4xx
from service.operation_service import OperationService
from common.api.utils import get_current_user_guid
from registration.api.router import router
from registration.models import Operation

##### GET #####


@router.get(
    "/operations/{uuid:operation_id}",
    response={200: OperationOut, custom_codes_4xx: Message},
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
    response={200: OperationOutWithDocuments, custom_codes_4xx: Message},
    tags=OPERATION_TAGS,
    description="""Retrieves the details of a specific operation by its ID along with it's documents""",
    exclude_none=True,
    auth=authorize("approved_authorized_roles"),
)
def get_operation_with_documents(request: HttpRequest, operation_id: UUID) -> Tuple[Literal[200], Operation]:
    operation = OperationService.get_if_authorized(get_current_user_guid(request), operation_id)
    return 200, operation


##### PUT ######


@router.put(
    "/operations/{uuid:operation_id}",
    response={200: OperationOut, custom_codes_4xx: Message},
    tags=OPERATION_TAGS,
    description="Updates the details of a specific operation by its ID.",
    auth=authorize("approved_industry_user"),
)
def update_operation(
    request: HttpRequest, operation_id: UUID, payload: OperationInformationInUpdate
) -> Tuple[Literal[200], Operation]:
    return 200, OperationService.update_operation(get_current_user_guid(request), payload, operation_id)


##### New stuff


class NewOperationInformationIn(Schema):
    name: Optional[str] = None
    type: Optional[str] = None
    registration_purpose: Optional[Operation.Purposes] = None
    regulated_products: Optional[List[int]] = None
    activities: Optional[List[int]] = None
    naics_code_id: Optional[int] = None
    secondary_naics_code_id: Optional[int] = None
    tertiary_naics_code_id: Optional[int] = None
    multiple_operators_array: Optional[List[MultipleOperatorIn]] = None
    date_of_first_shipment: Optional[str] = None
    operation_representatives: Optional[List[int]] = None


@router.post(
    "/operations/{uuid:operation_id}/new",
    response={200: OperationOut, custom_codes_4xx: Message},
    tags=OPERATION_TAGS,
    description="Updates the details of a specific operation by its ID, with files being passed as multipart form data.",
)
def update_operation_new(
    request: HttpRequest,
    operation_id: UUID,
    details: NewOperationInformationIn,
    boundary_map: File[UploadedFile] = None,
    process_flow_diagram: File[UploadedFile] = None,
    new_entrant_application: File[UploadedFile] = None,
) -> Tuple[Literal[200], Operation]:

    raise Exception(details)

    return 200, Operation.objects.first()
