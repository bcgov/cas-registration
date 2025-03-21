import json
from typing import Callable
from django.http import HttpRequest
from registration.models.operation import Operation
from registration.models.user_operator import UserOperator
from reporting.models.report_version import ReportVersion


def validate_version_ownership_from_url(
    version_id_param: str,
) -> Callable[[HttpRequest], bool]:
    def validate_func(request: HttpRequest) -> bool:
        if not request.resolver_match:
            return False

        report_version_id = request.resolver_match.kwargs[version_id_param]
        report_version = ReportVersion.objects.get(pk=report_version_id)
        user_operator = UserOperator.objects.filter(
            user=request.current_user, operator=report_version.report.operator  # type: ignore
        ).first()

        return (
            user_operator is not None
            and user_operator.role != UserOperator.Roles.PENDING
            and user_operator.status == UserOperator.Statuses.APPROVED
        )

    return validate_func


def validate_operation_ownership_from_payload() -> Callable[[HttpRequest], bool]:
    def validate_func(request: HttpRequest) -> bool:
        operation_id = json.loads(request.body)["operation_id"]
        operation = Operation.objects.get(pk=operation_id)
        user_operator = UserOperator.objects.filter(user=request.current_user, operator=operation.operator).first()  # type: ignore

        return (
            user_operator is not None
            and user_operator.role != UserOperator.Roles.PENDING
            and user_operator.status == UserOperator.Statuses.APPROVED
        )

    return validate_func
