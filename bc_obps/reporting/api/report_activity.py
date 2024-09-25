from uuid import UUID
from django.http import HttpRequest
from registration.api.utils.current_user_utils import get_current_user_guid
from registration.decorators import handle_http_errors
from reporting.schema.generic import Message
from reporting.schema.report_activity_data import ReportActivityDataIn
from reporting.service.report_activity_save_service import ReportActivitySaveService
from service.error_service import custom_codes_4xx
from .router import router


@router.post(
    "reports/{report_version_id}/facilities/{facility_id}/activity/{activity_id}/report-activity",
    response={200: int, custom_codes_4xx: Message},
)
@handle_http_errors()
def save_report_activity_data(
    request: HttpRequest,
    report_version_id: int,
    facility_id: UUID,
    activity_id: int,
    payload: ReportActivityDataIn,
) -> int:

    user_guid = get_current_user_guid(request)

    service = ReportActivitySaveService(report_version_id, facility_id, activity_id, user_guid)
    service.save(payload.activity_data)

    return 200
