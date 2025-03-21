import json
import logging
from typing import Callable
from django.http import HttpRequest
from registration.models.operation import Operation
from registration.models.user_operator import UserOperator
from reporting.models.report_version import ReportVersion

logger = logging.getLogger(__name__)


def is_access_granted(user_operator: UserOperator | None) -> bool:
    return (
        user_operator is not None
        and user_operator.role != UserOperator.Roles.PENDING
        and user_operator.status == UserOperator.Statuses.APPROVED
    )


def validate_version_ownership_from_url(
    version_id_param: str,
) -> Callable[[HttpRequest], bool]:
    def validate_func(request: HttpRequest) -> bool:
        if not request.resolver_match:
            logger.warning("No resolver_match attribute found on request.")
            return False

        report_version_id = request.resolver_match.kwargs.get(version_id_param)
        if not report_version_id:
            logger.warning("No report_version_id found in request.")
            return False

        report_version = ReportVersion.objects.filter(pk=report_version_id).first()
        if not report_version:
            logger.warning("No report version found.")
            return False

        user_operator = UserOperator.objects.filter(
            user=request.current_user,  # type: ignore
            operator=report_version.report.operator,
        ).first()

        return is_access_granted(user_operator)

    return validate_func


def validate_operation_ownership_from_payload() -> Callable[[HttpRequest], bool]:
    def validate_func(request: HttpRequest) -> bool:
        operation_id = json.loads(request.body).get("operation_id")

        if not operation_id:
            logger.warning("Couldn't find operation_id field in payload.")
            return False

        operation = Operation.objects.filter(pk=operation_id).first()
        if not operation:
            logger.warning("Couldn't find operation record.")
            return False

        user_operator = UserOperator.objects.filter(
            user=request.current_user, operator=operation.operator  # type: ignore
        ).first()

        return is_access_granted(user_operator)

    return validate_func
