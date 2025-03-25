from enum import Enum
from typing import Optional

from ninja import Query
from django.http import HttpRequest
from registration.api._user_operators._current.has_registered_operation import (
    get_current_user_operator_has_registered_operation,
)
from .router import router
from ..models import ReportVersion
from ..schema.validate_reporting_user import UserStatusResponse


class UserStatusEnum(Enum):
    REGISTERED = "Registered"
    NOT_REGISTERED = "Not Registered"
    REGISTERED_AND_VALID = "Registered and Valid Report Version"
    REGISTERED_AND_INVALID = "Registered and Invalid Report Version"


@router.get("/validate_user_report_version", response=UserStatusResponse)
def validate_user_report_version(request: HttpRequest, report_version_id: Optional[str] = Query(None)) -> dict:
    status, has_registered_operation = get_current_user_operator_has_registered_operation(request)

    if not has_registered_operation:
        return {"status": UserStatusEnum.NOT_REGISTERED.value}

    if report_version_id and report_version_id != "null":
        report_version_exists = ReportVersion.objects.filter(pk=report_version_id).exists()
        user_status = (
            UserStatusEnum.REGISTERED_AND_VALID if report_version_exists else UserStatusEnum.REGISTERED_AND_INVALID
        )
        return {"status": user_status.value}

    # If no report_version_id provided, return just the registration status
    return {"status": UserStatusEnum.REGISTERED.value}
