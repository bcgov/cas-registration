from uuid import UUID
from django.db import transaction
from registration.utils import generate_useful_error
from registration.decorators import authorize
from registration.api.api_base import router
from datetime import datetime
from django.core.exceptions import ValidationError
from zoneinfo import ZoneInfo
from registration.models import (
    AppRole,
    Operation,
    Operator,
    User,
)
from registration.schema import (
    Message,
    OperationUpdateStatusIn,
    OperationUpdateStatusOut,
)
from ninja.responses import codes_4xx, codes_5xx
from ninja.errors import HttpError


@router.put(
    "/operation/{operation_id}/update-status",
    response={200: OperationUpdateStatusOut, codes_4xx: Message, codes_5xx: Message},
    url_name="update_operation_status",
)
@authorize(AppRole.get_authorized_irc_roles())
def update_operation_status(request, operation_id: UUID, payload: OperationUpdateStatusIn):
    try:
        operation = Operation.objects.select_related('operator', 'bc_obps_regulated_operation').get(id=operation_id)
    except Operation.DoesNotExist:
        raise HttpError(404, "Not Found")
    user: User = request.current_user
    try:
        with transaction.atomic():
            status = Operation.Statuses(payload.status)
            if status in [Operation.Statuses.APPROVED, Operation.Statuses.DECLINED]:
                operation.verified_at = datetime.now(ZoneInfo("UTC"))
                operation.verified_by_id = user.pk
                if status == Operation.Statuses.APPROVED:
                    operation.generate_unique_boro_id()
                    # approve the operator if it's not already approved (the case for imported operators)
                    operator: Operator = operation.operator
                    if operator.status != Operator.Statuses.APPROVED:
                        operator.status = Operator.Statuses.APPROVED
                        operator.is_new = False
                        operator.verified_at = datetime.now(ZoneInfo("UTC"))
                        operator.verified_by_id = user.pk
                        operator.save(update_fields=["status", "is_new", "verified_at", "verified_by_id"])
                        operator.set_create_or_update(user.pk)
            operation.status = status
            operation.save(update_fields=['status', 'verified_at', 'verified_by_id', 'bc_obps_regulated_operation'])
            operation.set_create_or_update(user.pk)
            return 200, operation
    except ValidationError as e:
        return 400, {"message": generate_useful_error(e)}
    except Exception as e:
        return 400, {"message": str(e)}
