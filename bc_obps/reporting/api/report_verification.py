from typing import Literal
from reporting.models.report_verification import ReportVerification
from common.permissions import authorize
from django.http import HttpRequest
from reporting.constants import EMISSIONS_REPORT_TAGS
from reporting.schema.generic import Message
from service.error_service.custom_codes_4xx import custom_codes_4xx
from .router import router
from reporting.schema.report_verification import ReportVerificationIn, ReportVerificationOut
from reporting.service.report_verification_service import ReportVerificationService


@router.get(
    "/report-version/{report_version_id}/report-verification",
    response={200: ReportVerificationOut, custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="""Fetches the Verification data associated with the given report version ID.""",
    auth=authorize("approved_industry_user"),
)
def get_report_verification_by_version_id(
    request: HttpRequest, report_version_id: int
) -> tuple[Literal[200], ReportVerification]:
    return 200, ReportVerificationService.get_report_verification_by_version_id(report_version_id)


@router.get(
    "/report-version/{report_version_id}/report-needs-verification",
    response={200: bool, custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="""Checks if a report needs verification data based on its purpose and attributable emissions.""",
    auth=authorize("approved_industry_user"),
)
def get_report_needs_verification(request: HttpRequest, report_version_id: int) -> tuple[Literal[200], bool]:
    return 200, ReportVerificationService.get_report_needs_verification(report_version_id)


@router.post(
    "/report-version/{report_version_id}/report-verification",
    response={200: ReportVerificationOut, custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="""Creates or updates the Verification data for the given report version ID.""",
    auth=authorize("approved_industry_user"),
)
def save_report_verification(
    request: HttpRequest, report_version_id: int, payload: ReportVerificationIn
) -> tuple[Literal[200], ReportVerification]:
    report_verification = ReportVerificationService.save_report_verification(report_version_id, payload)
    return 200, report_verification
