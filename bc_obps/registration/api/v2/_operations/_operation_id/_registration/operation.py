from typing import Literal, Tuple
from uuid import UUID
from django.http import HttpRequest
from registration.schema.v1.operation import OperationUpdateStatusOut
from registration.schema.v2.operation import (
    OperationInformationIn,
    OperationUpdateOut,
    RegistrationPurposeIn,
    OperationRegistrationSubmissionIn,
    OperationStatutoryDeclarationIn,
    OperationStatutoryDeclarationOut,
)
from service.operation_service_v2 import OperationServiceV2
from registration.constants import OPERATION_TAGS, V2
from common.permissions import authorize
from registration.api.utils.current_user_utils import get_current_user_guid
from service.error_service.custom_codes_4xx import custom_codes_4xx
from registration.models import Operation
from registration.decorators import handle_http_errors
from registration.api.router import router
from registration.schema.generic import Message
from ninja.responses import codes_4xx


##### PUT #####


@router.put(
    "/v2/operations/{operation_id}/registration/operation",
    response={200: OperationUpdateOut, custom_codes_4xx: Message},
    tags=V2,
    description="""Updates the registration purpose and regulated products (if applicable) of a specific operation by its ID.
    The endpoint ensures that only authorized industry users can update operations belonging to their operator. Unauthorized access attempts raise an error.""",
    auth=authorize('approved_industry_user'),
)
@handle_http_errors()
def register_edit_operation_information(
    request: HttpRequest, operation_id: UUID, payload: OperationInformationIn
) -> Tuple[Literal[200], Operation]:
    return 200, OperationServiceV2.register_operation_information(get_current_user_guid(request), payload)


@router.put(
    "/v2/operations/{operation_id}/registration/statutory-declaration",
    response={200: OperationUpdateOut, codes_4xx: Message},
    tags=OPERATION_TAGS,
    description="Creates or replaces a statutory declaration document for an Operation",
    auth=authorize("approved_industry_user"),
)
@handle_http_errors()
def create_or_replace_statutory_declarations(
    request: HttpRequest, operation_id: UUID, payload: OperationStatutoryDeclarationIn
) -> Tuple[Literal[200], Operation]:
    return 200, OperationServiceV2.create_or_replace_statutory_declaration(
        get_current_user_guid(request), operation_id, payload
    )


@router.patch(
    "/v2/operations/{uuid:operation_id}/registration/submission",
    response={200: OperationUpdateStatusOut, custom_codes_4xx: Message},
    tags=V2,
    description="""Updates the status of an operation to 'Registered' when the registration is submitted.
    The endpoint ensures that only authorized industry users can update operations belonging to their operator.""",
    auth=authorize('approved_industry_user'),
)
@handle_http_errors()
def operation_registration_submission(
    request: HttpRequest, operation_id: UUID, payload: OperationRegistrationSubmissionIn
) -> Tuple[Literal[200], Operation]:
    # Check if all checkboxes are checked
    if not all(
        [payload.acknowledgement_of_review, payload.acknowledgement_of_information, payload.acknowledgement_of_records]
    ):
        raise Exception("All checkboxes must be checked to submit the registration.")
    return 200, OperationServiceV2.update_status(
        get_current_user_guid(request), operation_id, Operation.Statuses.REGISTERED
    )
