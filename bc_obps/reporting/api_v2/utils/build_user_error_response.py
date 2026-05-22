from typing import Any
from common.exceptions import UserError
from reporting.api_v2.forms.form_response_builder import FormResponseBuilder
from reporting.api_v2.utils.validation_error_serializer import serialize_user_error


def build_user_error_response(
    version_id: int,
    error: UserError,
) -> dict[str, Any]:
    error.context = {
        "report_version_id": version_id,
        **(error.context or {}),
    }

    return FormResponseBuilder(version_id).operation_data().payload({"errors": [serialize_user_error(error)]}).build()
