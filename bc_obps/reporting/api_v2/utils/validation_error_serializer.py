from typing import Any
from reporting.service.report_validation.report_validation_error import ReportValidationError
from common.exceptions import UserError


def _build_error_data(error: Any) -> dict[str, Any]:
    error_data: dict[str, Any] = {
        "severity": error.severity.value,
        "message": error.message,
    }

    if error.context:
        if hasattr(error.context, "model_dump"):
            error_data["context"] = error.context.model_dump(
                exclude_none=True,
                by_alias=False,
            )
        else:
            error_data["context"] = error.context

    return error_data


def serialize_report_validation_error(
    error: ReportValidationError,
) -> dict[str, Any]:
    return {
        "key": getattr(error.key, "value", error.key),
        "error": _build_error_data(error),
    }


def serialize_user_error(error: UserError) -> dict[str, Any]:
    return {
        "key": getattr(error.key, "value", error.key),
        "error": _build_error_data(error),
    }
