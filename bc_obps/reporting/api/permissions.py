import json
import logging
from typing import Callable
from common.permissions import authorize, compose_auth
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


def _validate_version_ownership_in_url(request: HttpRequest, version_id_param: str) -> bool:
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


def _validate_operation_ownership(request: HttpRequest) -> bool:
    operation_id = json.loads(request.body).get("operation_id")

    if not operation_id:
        logger.warning("Couldn't find operation_id field in payload.")
        return False

    operation = Operation.objects.filter(pk=operation_id).first()
    if not operation:
        logger.warning("Couldn't find operation record.")
        return False

    user_operator = UserOperator.objects.filter(
        user=request.current_user,  # type: ignore
        operator=operation.operator,
    ).first()

    return is_access_granted(user_operator)


def check_version_ownership_in_url(
    version_id_param: str,
) -> Callable[[HttpRequest], bool]:
    def validate_func(request: HttpRequest) -> bool:
        return _validate_version_ownership_in_url(request, version_id_param)

    return validate_func


def check_operation_ownership() -> Callable[[HttpRequest], bool]:
    def validate_func(request: HttpRequest) -> bool:
        return _validate_operation_ownership(request)

    return validate_func


approved_industry_user_report_version_composite_auth: Callable[[HttpRequest], bool] = compose_auth(
    authorize("approved_industry_user"), check_version_ownership_in_url("version_id")
)
approved_authorized_roles_report_version_composite_auth: Callable[[HttpRequest], bool] = compose_auth(
    authorize("approved_authorized_roles"), check_version_ownership_in_url("version_id")
)
