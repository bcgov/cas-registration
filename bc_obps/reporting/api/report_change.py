from typing import Literal, Optional
from django.http import HttpRequest
from reporting.constants import EMISSIONS_REPORT_TAGS
from reporting.schema.generic import Message
from service.error_service.custom_codes_4xx import custom_codes_4xx
from .router import router
from reporting.models.report_change import ReportChange
from reporting.schema.report_change import ReportChangeIn, ReportChangeOut
from reporting.service.report_change_service import ReportChangeService
from reporting.api.permissions import approved_industry_user_report_version_composite_auth


@router.get(
    "/report-version/{version_id}/report-change",
    response={200: Optional[ReportChangeOut], custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="""Fetches the report change data associated with the given report version ID.""",
    auth=approved_industry_user_report_version_composite_auth,
)
def get_report_change_by_version_id(
    request: HttpRequest, version_id: int
) -> tuple[Literal[200], Optional[ReportChange]]:
    return 200, ReportChangeService.get_report_change_by_version_id(version_id)


@router.post(
    "/report-version/{version_id}/report-change",
    response={200: ReportChangeOut, custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="""Creates or updates the report change data for the given report version ID.""",
    auth=approved_industry_user_report_version_composite_auth,
)
def save_report_change(
    request: HttpRequest, version_id: int, payload: ReportChangeIn
) -> tuple[Literal[200], ReportChange]:
    report_change = ReportChangeService.save_report_change(version_id, payload)
    return 200, report_change
