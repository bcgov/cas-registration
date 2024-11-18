from typing import Literal
from common.permissions import authorize
from django.http import HttpRequest
from registration.decorators import handle_http_errors
from reporting.constants import EMISSIONS_REPORT_TAGS 
from reporting.schema.generic import Message
from service.error_service.custom_codes_4xx import custom_codes_4xx
from .router import router
from reporting.schema.report_verification import ReportVerificationIn, ReportVerificationOut
from reporting.service.report_verification_service import ReportVerificationService

@router.post(
    "/report-version/{version_id}/report-verification",
    response={200: ReportVerificationOut, custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="""Creates or updates the Verification data for the given report version ID.""",
    auth=authorize("approved_industry_user"),
)
@handle_http_errors()
def save_report_verification(
    request: HttpRequest, version_id: int, payload: ReportVerificationIn
) -> tuple[Literal[200], ReportVerificationOut]:
    report_verification = ReportVerificationService.save_report_verification(version_id, payload)
    return 200, report_verification
