from typing import Literal

from common.api.utils import get_current_user_guid
from common.permissions import authorize
from common.service.error_service.custom_codes_4xx import custom_codes_4xx
from django.db.models import QuerySet
from django.http import HttpRequest
from ninja import File, Query, UploadedFile
from ninja.pagination import paginate
from registration.api.router import router
from registration.constants import OPERATION_TAGS
from registration.models.operation import Operation
from registration.models.operation_designated_operator_timeline import (
    OperationDesignatedOperatorTimeline,
)
from registration.schema import (
    Message,
    OperationInformationIn,
    OperationTimelineFilterSchema,
    OperationTimelineListOut,
)
from registration.schema.operation import OperationUpdateOut
from registration.service.data_types.operation_service import (
    MultipleOperatorData,
    OperationData,
)
from registration.service.operation_service import OperationService
from registration.utils import CustomPagination

##### GET #####


@router.get(
    "/operations",
    response={200: list[OperationTimelineListOut], custom_codes_4xx: Message},
    tags=OPERATION_TAGS,
    auth=authorize("approved_authorized_roles"),
)
@paginate(CustomPagination)
def list_operations(
    request: HttpRequest,
    filters: OperationTimelineFilterSchema = Query(...),
    sort_field: str | None = "operation__created_at",
    sort_order: Literal["desc", "asc"] | None = "desc",
    paginate_result: bool = Query(True, description="Whether to paginate the results"),
) -> QuerySet[OperationDesignatedOperatorTimeline]:
    # NOTE: PageNumberPagination raises an error if we pass the response as a tuple (like 200, ...)
    return OperationService.list_operations_timeline(
        get_current_user_guid(request), sort_field, sort_order, filters
    )


REGISTRATION_PURPOSES_LITERALS = Literal[
    Operation.Purposes.REPORTING_OPERATION,
    Operation.Purposes.ELECTRICITY_IMPORT_OPERATION,
    Operation.Purposes.NEW_ENTRANT_OPERATION,
    Operation.Purposes.OBPS_REGULATED_OPERATION,
    Operation.Purposes.OPTED_IN_OPERATION,
    Operation.Purposes.POTENTIAL_REPORTING_OPERATION,
]


@router.get(
    "/operations/registration-purposes",
    response={200: list[REGISTRATION_PURPOSES_LITERALS], custom_codes_4xx: Message},
    tags=OPERATION_TAGS,
    description="""Retrieves a list of strings representing the valid options for an operation's registration purpose (aka registration category).""",
    auth=authorize("approved_authorized_roles"),
)
def get_registration_purposes(
    request: HttpRequest,
) -> tuple[Literal[200], list[REGISTRATION_PURPOSES_LITERALS]]:
    purposes = [purpose for purpose in Operation.Purposes]
    return 200, purposes


##### POST #####
@router.post(
    "/operations",
    response={201: OperationUpdateOut, custom_codes_4xx: Message},
    tags=OPERATION_TAGS,
    description="""Creates a new operation for the current user and starts the registration process.
    It associates the new operation with the current user's approved user-operator.""",
    auth=authorize("approved_industry_user"),
)
def register_create_operation_information(
    request: HttpRequest,
    payload: OperationInformationIn,
    boundary_map: File[UploadedFile] = None,  # type: ignore
    process_flow_diagram: File[UploadedFile] = None,  # type: ignore
    new_entrant_application: File[UploadedFile] = None,  # type: ignore
) -> tuple[Literal[201], Operation]:
    operation_data = OperationData(
        **payload.model_dump(exclude={"multiple_operators_array"}),
        multiple_operators_array=(
            [
                MultipleOperatorData(
                    **op.model_dump(exclude={"business_structure"}),
                    business_structure_id=op.business_structure.name,  # type: ignore
                )
                for op in payload.multiple_operators_array or []
            ]
        ),
        boundary_map=boundary_map,
        process_flow_diagram=process_flow_diagram,
        new_entrant_application=new_entrant_application,
    )

    new_operation = OperationService.register_operation_information(
        get_current_user_guid(request), None, operation_data
    )

    return 201, new_operation
