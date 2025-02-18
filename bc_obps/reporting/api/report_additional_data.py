from typing import Literal, Tuple, Optional
from django.http import HttpRequest

from common.permissions import authorize
from reporting.constants import EMISSIONS_REPORT_TAGS
from reporting.schema.generic import Message
from service.error_service.custom_codes_4xx import custom_codes_4xx
from reporting.service.report_additional_data import ReportAdditionalDataService
from .router import router
from ..models import ReportAdditionalData
from ..schema.report_additional_data import ReportAdditionalDataOut, ReportAdditionalDataIn


@router.get(
    "/report-version/{version_id}/registration_purpose",
    response={200: dict, custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="""Fetches the registration purpose for the operation associated with the given report version ID.""",
    auth=authorize("approved_industry_user"),
)
def get_registration_purpose_by_version_id(request: HttpRequest, version_id: int) -> Tuple[Literal[200], dict]:
    response_data = ReportAdditionalDataService.get_registration_purpose_by_version_id(version_id)

    return 200, response_data


@router.post(
    "/report-version/{version_id}/additional-data",
    response={201: ReportAdditionalDataOut, custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="Creates or updates additional report data.",
    auth=authorize("approved_industry_user"),
)
def save_report_additional_data(
    request: HttpRequest, version_id: int, payload: ReportAdditionalDataIn
) -> tuple[Literal[201], ReportAdditionalData]:
    report_contact = ReportAdditionalDataService.save_report_additional_data(version_id, payload)
    return 201, report_contact


@router.get(
    "/report-version/{report_version_id}/report-additional-data",
    response={200: ReportAdditionalDataOut, custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="""Takes version_id (primary key of Report_Version model) and returns its report_operation object.""",
    auth=authorize("approved_industry_user"),
)
def get_report_additional_data_by_version_id(
    request: HttpRequest, report_version_id: int
) -> tuple[Literal[200], Optional[ReportAdditionalData]]:
    report_additional_data = ReportAdditionalDataService.get_report_report_additional_data(report_version_id)
    return 200, report_additional_data
