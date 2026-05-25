from typing import Any, Literal, Tuple
from django.http import HttpRequest
from reporting.api.permissions import approved_industry_user_report_version_composite_auth
from reporting.constants import EMISSIONS_REPORT_TAGS
from reporting.schema.generic import Message
from reporting.service.report_validation.report_validation_service import (
    ReportValidationService,
)
from service.error_service.custom_codes_4xx import custom_codes_4xx
from reporting.service.report_validation.report_validation_tags import ValidationTags
from ..router import router
from reporting.api_v2.validation.validation_schema import ValidationErrorsResponseSchema
from reporting.api_v2.response_builder import ResponseBuilder


@router.get(
    "report-version/{version_id}/validation/report-validation",
    response={
        200: ValidationErrorsResponseSchema,
        custom_codes_4xx: Message,
    },
    tags=EMISSIONS_REPORT_TAGS,
    description="Returns report validation errors.",
    exclude_none=True,
    auth=approved_industry_user_report_version_composite_auth,
)
def get_report_validation_data(
    request: HttpRequest,
    version_id: int,
) -> Tuple[Literal[200], dict[str, Any]]:
    errors = ReportValidationService.validate_report_version(
        version_id=version_id,
        tag=ValidationTags.REPORT_VALIDATION,
    )

    return (
        200,
        ResponseBuilder().errors(errors.values()).build(),
    )
