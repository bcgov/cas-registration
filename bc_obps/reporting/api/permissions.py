import json
import logging
from typing import Callable
from uuid import UUID
from common.permissions import authorize, compose_auth
from django.http import HttpRequest
from registration.models.user_operator import UserOperator
from reporting.models.report import Report
from reporting.models.report_version import ReportVersion
from registration.models.operator import Operator
from service.operation_designated_operator_timeline_service import OperationDesignatedOperatorTimelineService

logger = logging.getLogger(__name__)


def is_access_granted(user_operator: UserOperator | None) -> bool:
    return (
        user_operator is not None
        and user_operator.role != UserOperator.Roles.PENDING
        and user_operator.status == UserOperator.Statuses.APPROVED
    )


def _validate_operator_ownership_in_url(
    request: HttpRequest, id_param: str, get_operator: Callable[[str], object | None]
) -> bool:
    # Generic helper to validate operator ownership from URL parameters.
    # Requires a function to get the operator from the URL parameter.
    if not request.resolver_match:
        logger.warning("No resolver_match attribute found on request.")
        return False

    obj_id = request.resolver_match.kwargs.get(id_param)
    if not obj_id:
        logger.warning(f"No {id_param} found in request.")
        return False

    operator = get_operator(obj_id)
    if not operator:
        return False

    user_operator = UserOperator.objects.filter(
        user=request.current_user,  # type: ignore
        operator=operator,
    ).first()

    return is_access_granted(user_operator)


def _validate_operator_owns_report_version_in_url(request: HttpRequest, version_id_param: str) -> bool:
    def get_operator(version_id: str) -> Operator | None:
        report_version = ReportVersion.objects.filter(pk=version_id).first()
        if not report_version:
            logger.warning("No report version found.")
            return None
        return report_version.report.operator

    return _validate_operator_ownership_in_url(request, version_id_param, get_operator)


def _validate_operator_owns_report_in_url(request: HttpRequest, report_id_param: str) -> bool:
    def get_operator(report_id: str) -> Operator | None:
        report = Report.objects.filter(pk=report_id).first()
        if not report:
            logger.warning("No report found.")
            return None
        return report.operator

    return _validate_operator_ownership_in_url(request, report_id_param, get_operator)


def _validate_operation_ownership(request: HttpRequest) -> bool:
    """
    Takes a request containing an operation_id and reporting_year and returns if the current user has access to that operation's operator.
    Uses the reporting year to find the designated operator for that operation in that year.
    """
    payload = json.loads(request.body)
    operation_id: UUID = payload.get("operation_id")
    reporting_year: int = payload.get("reporting_year")

    if not operation_id:
        logger.warning("Couldn't find operation_id field in payload.")
        return False
    if not reporting_year:
        logger.info("Couldn't find reporting_year field in payload.")
        return False

    timeline = OperationDesignatedOperatorTimelineService.get_operation_designated_operator_for_reporting_year(
        operation_id, reporting_year
    )
    if not timeline:
        logger.warning("No designated operator found for operation and reporting year.")
        return False

    user_operator = UserOperator.objects.filter(
        user=request.current_user,  # type: ignore
        operator=timeline.operator,
    ).first()

    return is_access_granted(user_operator)


def check_version_ownership_in_url(
    version_id_param: str,
) -> Callable[[HttpRequest], bool]:
    def validate_func(request: HttpRequest) -> bool:
        # Internal users can access all report versions
        if request.current_user.is_irc_user():  # type: ignore
            return True

        return _validate_operator_owns_report_version_in_url(request, version_id_param)

    return validate_func


def check_report_ownership_in_url(
    report_id_param: str,
) -> Callable[[HttpRequest], bool]:
    def validate_func(request: HttpRequest) -> bool:
        # Internal users can access all reports
        if request.current_user.is_irc_user():  # type: ignore
            return True
        return _validate_operator_owns_report_in_url(request, report_id_param)

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
approved_industry_user_report_composite_auth: Callable[[HttpRequest], bool] = compose_auth(
    authorize("approved_industry_user"), check_report_ownership_in_url("report_id")
)
