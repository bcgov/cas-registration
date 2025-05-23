from typing import Literal, Tuple
from uuid import UUID
from django.http import HttpRequest
from common.exceptions import UserError
from registration.schema import OperationRegistrationSubmissionIn, OperationUpdateStatusOut, Message
from service.operation_service import OperationService
from registration.constants import OPERATION_TAGS
from common.permissions import authorize
from common.api.utils import get_current_user_guid
from service.error_service.custom_codes_4xx import custom_codes_4xx
from registration.models import Operation
from registration.api.router import router


@router.patch(
    "/operations/{uuid:operation_id}/registration/submission",
    response={200: OperationUpdateStatusOut, custom_codes_4xx: Message},
    tags=OPERATION_TAGS,
    description="""Updates the status of an operation to 'Registered' when the registration is submitted.
    The endpoint ensures that only authorized industry users can update operations belonging to their operator.""",
    auth=authorize('approved_industry_user'),
)
def operation_registration_submission(
    request: HttpRequest, operation_id: UUID, payload: OperationRegistrationSubmissionIn
) -> Tuple[Literal[200], Operation | None]:
    # Check if all checkboxes are checked
    if not all(
        [payload.acknowledgement_of_review, payload.acknowledgement_of_information, payload.acknowledgement_of_records]
    ):
        raise UserError("All checkboxes must be checked to submit the registration.")

    return 200, OperationService.update_status(
        get_current_user_guid(request), operation_id, Operation.Statuses.REGISTERED
    )
