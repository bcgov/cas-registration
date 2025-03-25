from typing import Literal
from uuid import UUID

from reporting.constants import EMISSIONS_REPORT_TAGS
from service.error_service.custom_codes_4xx import custom_codes_4xx
from django.http import HttpRequest
from reporting.schema.generic import Message
from .router import router
from ..schema.report_review_facility import ReportReviewFacilitySchemaOut
from ..service.report_facilities_service import ReportFacilitiesService
from reporting.api.permissions import approved_industry_user_report_version_composite_auth


@router.get(
    "report-version/{version_id}/review-facilities",
    response={200: ReportReviewFacilitySchemaOut, custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="""Retrieves the list of selected facilities for a report version""",
    exclude_none=True,
    auth=approved_industry_user_report_version_composite_auth,
)
def get_selected_facilities(request: HttpRequest, version_id: int) -> tuple[int, dict]:
    response_data = ReportFacilitiesService.get_all_facilities_for_review(version_id)
    return 200, response_data


@router.post(
    "report-version/{version_id}/review-facilities",
    response={200: int, custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="""Saves the list of selected facilities for a report version""",
    auth=approved_industry_user_report_version_composite_auth,
)
def save_selected_facilities(
    request: HttpRequest,
    version_id: int,
    payload: list[UUID],
) -> Literal[200]:
    ReportFacilitiesService.save_selected_facilities(
        version_id,
        payload,
    )

    return 200
