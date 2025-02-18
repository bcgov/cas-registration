from typing import Literal
from uuid import UUID

from common.permissions import authorize
from reporting.constants import EMISSIONS_REPORT_TAGS
from service.error_service.custom_codes_4xx import custom_codes_4xx
from django.http import HttpRequest
from reporting.schema.generic import Message
from .router import router
from ..schema.report_review_facility import ReportReviewFacilitySchemaOut
from ..service.report_facilities_service import ReportFacilitiesService


@router.get(
    "report-version/{report_version_id}/review-facilities",
    response={200: ReportReviewFacilitySchemaOut, custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="""Retrieves the list of selected facilities for a report version""",
    exclude_none=True,
    auth=authorize("approved_industry_user"),
)
def get_selected_facilities(request: HttpRequest, report_version_id: int) -> tuple[int, dict]:
    response_data = ReportFacilitiesService.get_all_facilities_for_review(report_version_id)
    return 200, response_data


@router.post(
    "report-version/{report_version_id}/review-facilities",
    response={200: int, custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="""Saves the list of selected facilities for a report version""",
    auth=authorize("approved_industry_user"),
)
def save_selected_facilities(
    request: HttpRequest,
    report_version_id: int,
    payload: list[UUID],
) -> Literal[200]:
    ReportFacilitiesService.save_selected_facilities(
        report_version_id,
        payload,
    )

    return 200
