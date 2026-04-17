from typing import Any, Literal, Tuple

from django.http import HttpRequest

from reporting.api.permissions import approved_industry_user_report_version_composite_auth
from reporting.api_v2.forms.form_response_builder import FormResponseBuilder
from reporting.api_v2.forms.form_schema import ReportingFormSchema
from reporting.constants import EMISSIONS_REPORT_TAGS
from reporting.schema.generic import Message
from reporting.schema.report_validation_data import ReportValidationPayloadSchema
from reporting.service.report_validation.report_validation_service import (
    ReportValidationService,
)
from service.error_service.custom_codes_4xx import custom_codes_4xx
from reporting.service.report_validation.report_validation_tags import ValidationTags

from ..router import router


@router.get(
    "report-version/{version_id}/forms/validation-data",
    response={
        200: ReportingFormSchema[ReportValidationPayloadSchema],
        custom_codes_4xx: Message,
    },
    tags=EMISSIONS_REPORT_TAGS,
    description="Validation data endpoint.",
    exclude_none=True,
    auth=approved_industry_user_report_version_composite_auth,
)
def get_report_validation_data(
    request: HttpRequest,
    version_id: int,
) -> Tuple[Literal[200], dict[str, Any]]:
    errors = ReportValidationService.validate_report_version(
        version_id=version_id, tag=ValidationTags.REPORT_VALIDATION
    )
    payload_errors: list[dict[str, Any]] = []

    for key, error in errors.items():
        error_data: dict[str, Any] = {
            "severity": error.severity.value,
            "message": error.message,
        }

        if error.context:
            error_data["context"] = error.context.model_dump(
                exclude_none=True,
                by_alias=False,
            )

        payload_errors.append(
            {
                "key": getattr(error.key, "value", error.key),
                "error": error_data,
            }
        )

    payload: dict[str, Any] = {"errors": payload_errors}

    response = FormResponseBuilder(version_id).operation_data().payload(payload).build()

    return 200, response
