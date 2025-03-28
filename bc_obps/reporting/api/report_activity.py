from typing import Literal, Tuple
from uuid import UUID
from django.http import HttpRequest
from common.api.utils import get_current_user_guid
from reporting.constants import EMISSIONS_REPORT_TAGS
from reporting.schema.generic import Message
from reporting.schema.report_activity_data import ReportActivityDataIn
from reporting.service.report_activity_load_service import ReportActivityLoadService
from reporting.service.report_activity_save_service import ReportActivitySaveService
from service.error_service.custom_codes_4xx import custom_codes_4xx
from .router import router
from reporting.api.permissions import approved_industry_user_report_version_composite_auth


@router.post(
    "report-version/{version_id}/facilities/{facility_id}/activity/{activity_id}/report-activity",
    response={200: dict, custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="""Saves the data for an activity report form, for a given report version, facility and activity; returns the id of the ReportActivity record on success.""",
    auth=approved_industry_user_report_version_composite_auth,
)
def save_report_activity_data(
    request: HttpRequest,
    version_id: int,
    facility_id: UUID,
    activity_id: int,
    payload: ReportActivityDataIn,
) -> Tuple[Literal[200], dict]:

    user_guid = get_current_user_guid(request)

    service = ReportActivitySaveService(version_id, facility_id, activity_id, user_guid)
    service.save(payload.activity_data)

    return load_report_activity_data(request, version_id, facility_id, activity_id)


@router.get(
    "report-version/{version_id}/facilities/{facility_id}/activity/{activity_id}/report-activity",
    response={200: dict, custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="""Loads the initial data for an activity report form, for a given report version, facility and activity.""",
    auth=approved_industry_user_report_version_composite_auth,
)
def load_report_activity_data(
    request: HttpRequest,
    version_id: int,
    facility_id: UUID,
    activity_id: int,
) -> Tuple[Literal[200], dict]:

    data = ReportActivityLoadService.load(version_id, facility_id, activity_id)

    return 200, data
