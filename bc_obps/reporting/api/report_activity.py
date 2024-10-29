from typing import Literal, Tuple
from uuid import UUID
from common.permissions import authorize
from django.http import HttpRequest
from common.api.utils import get_current_user_guid
from registration.decorators import handle_http_errors
from reporting.constants import EMISSIONS_REPORT_TAGS
from reporting.models.report_activity import ReportActivity
from reporting.schema.generic import Message
from reporting.schema.report_activity_data import ReportActivityDataIn, ReportActivityDataOut
from reporting.service.report_activity_save_service import ReportActivitySaveService
from reporting.service.serializers import ReportActivitySerializer
from service.error_service import custom_codes_4xx
from .router import router


@router.post(
    "report-version/{report_version_id}/facilities/{facility_id}/activity/{activity_id}/report-activity",
    response={200: int, custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="""Saves the data for an activity report form, for a given report version, facility and activity; returns the id of the ReportActivity record on success.""",
    auth=authorize('approved_industry_user'),
)
@handle_http_errors()
def save_report_activity_data(
    request: HttpRequest,
    report_version_id: int,
    facility_id: UUID,
    activity_id: int,
    payload: ReportActivityDataIn,
) -> Tuple[Literal[200], int]:

    user_guid = get_current_user_guid(request)

    service = ReportActivitySaveService(report_version_id, facility_id, activity_id, user_guid)
    report_activity = service.save(payload.activity_data)

    return 200, report_activity.id


@router.get(
    "report-version/{report_version_id}/facilities/{facility_id}/activity/{activity_id}/report-activity",
    response={200: ReportActivityDataOut, custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="""Loads the initial data for an activity report form, for a given report version, facility and activity.""",
)
# @handle_http_errors()
def load_report_activity_data(
    request: HttpRequest,
    report_version_id: int,
    facility_id: UUID,
    activity_id: int,
) -> Tuple[Literal[200], ReportActivityDataOut]:

    r = ReportActivity.objects.get(
        report_version_id=report_version_id, facility_report__facility_id=facility_id, activity_id=activity_id
    )

    s = ReportActivitySerializer.serialize(r)

    return 200, {"form_data": s}
