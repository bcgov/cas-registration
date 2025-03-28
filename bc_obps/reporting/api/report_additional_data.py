from typing import Literal, Optional
from django.http import HttpRequest

from reporting.constants import EMISSIONS_REPORT_TAGS
from reporting.schema.generic import Message
from service.error_service.custom_codes_4xx import custom_codes_4xx
from reporting.service.report_additional_data import ReportAdditionalDataService
from .router import router
from ..models import ReportAdditionalData
from ..schema.report_additional_data import ReportAdditionalDataOut, ReportAdditionalDataIn
from reporting.api.permissions import approved_industry_user_report_version_composite_auth


@router.post(
    "/report-version/{version_id}/additional-data",
    response={201: ReportAdditionalDataOut, custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="Creates or updates additional report data.",
    auth=approved_industry_user_report_version_composite_auth,
)
def save_report_additional_data(
    request: HttpRequest, version_id: int, payload: ReportAdditionalDataIn
) -> tuple[Literal[201], ReportAdditionalData]:
    report_additional_data = ReportAdditionalDataService.save_report_additional_data(version_id, payload)
    return 201, report_additional_data


@router.get(
    "/report-version/{version_id}/report-additional-data",
    response={200: ReportAdditionalDataOut, custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="""Takes version_id (primary key of Report_Version model) and returns its report_operation object.""",
    auth=approved_industry_user_report_version_composite_auth,
)
def get_report_additional_data_by_version_id(
    request: HttpRequest, version_id: int
) -> tuple[Literal[200], Optional[ReportAdditionalData]]:
    report_additional_data = ReportAdditionalDataService.get_report_report_additional_data(version_id)
    return 200, report_additional_data
