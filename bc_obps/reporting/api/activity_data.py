from typing import Tuple
from uuid import UUID

from common.permissions import authorize
from common.service.error_service.custom_codes_4xx import custom_codes_4xx
from django.http import HttpRequest
from registration.service.activity_service import ActivityService
from reporting.api.permissions import (
    approved_industry_user_report_version_composite_auth,
)
from reporting.schema.generic import Message

from .router import router

##### GET #####


@router.get(
    "/report-version/{version_id}/facility-report/{facility_id}/initial-activity-data",
    response={200: str, custom_codes_4xx: Message},
    auth=approved_industry_user_report_version_composite_auth,
)
def get_initial_activity_data(
    request: HttpRequest, version_id: int, facility_id: UUID, activity_id: int
) -> tuple[int, str]:
    return 200, ActivityService.get_initial_activity_data(
        version_id, facility_id, activity_id
    )


@router.get(
    "/activities",
    response={200: list, custom_codes_4xx: Message},
    auth=authorize("approved_authorized_roles"),
)
def get_activities(request: HttpRequest) -> tuple[int, list]:
    return 200, ActivityService.get_all_activities()
