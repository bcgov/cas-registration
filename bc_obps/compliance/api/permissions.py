import logging
from typing import Callable
from common.permissions import authorize, compose_auth
from compliance.models.compliance_report_version import ComplianceReportVersion
from django.http import HttpRequest
from registration.models.user_operator import UserOperator

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

    compliance_report_version_id = request.resolver_match.kwargs.get(version_id_param)
    if not compliance_report_version_id:
        logger.warning("No compliance_report_version_id found in request.")
        return False

    compliance_report_version = ComplianceReportVersion.objects.filter(pk=compliance_report_version_id).first()
    if not compliance_report_version:
        logger.warning("No report version found.")
        return False

    # this is the operator at the time the report was submitted, which may not be the same as the current operator if the operation was transferred
    operator = compliance_report_version.compliance_report.report.operator

    # operation: Operation = ComplianceReportVersionService.get_operation_by_compliance_report_version(
    #     compliance_report_version_id
    # )

    # created_at = compliance_report_version.compliance_report.created_at

    # if not created_at:
    #     logger.warning("Compliance report is missing created_at date.")
    #     return False

    # timeline = (
    #     OperationDesignatedOperatorTimeline.objects.filter(
    #         operation=operation,
    #         start_date__lte=created_at.date(),  # ownership started on or before the report was created
    #     )
    #     .filter(
    #         Q(end_date__gte=created_at.date())
    #         | Q(end_date__isnull=True)  # ownership is ongoing or didn't end until after the report was created
    #     )
    #     .first()
    # )

    # if not timeline:
    #     logger.warning("No valid operation timeline found for the compliance report version.")
    #     return False
    # operator = timeline.operator

    user_operator = UserOperator.objects.filter(
        user=request.current_user,  # type: ignore
        operator=operator,
    ).first()

    return is_access_granted(user_operator)


def check_compliance_version_ownership_in_url(
    version_id_param: str,
) -> Callable[[HttpRequest], bool]:
    def validate_func(request: HttpRequest) -> bool:
        # Internal users can access all compliance report versions
        if request.current_user.is_irc_user():  # type: ignore
            return True

        return _validate_version_ownership_in_url(request, version_id_param)

    return validate_func


approved_industry_user_compliance_report_version_composite_auth: Callable[[HttpRequest], bool] = compose_auth(
    authorize("approved_industry_user"), check_compliance_version_ownership_in_url("version_id")
)
approved_authorized_roles_compliance_report_version_composite_auth: Callable[[HttpRequest], bool] = compose_auth(
    authorize("approved_authorized_roles"), check_compliance_version_ownership_in_url("version_id")
)
approved_industry_user_cas_director_cas_analyst_compliance_report_version_composite_auth: Callable[
    [HttpRequest], bool
] = compose_auth(
    authorize("cas_director_analyst_and_approved_industry_user"),
    check_compliance_version_ownership_in_url("version_id"),
)
