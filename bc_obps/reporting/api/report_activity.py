from uuid import UUID
from django.http import HttpRequest
from registration.decorators import handle_http_errors
from reporting.models.report_activity import ReportActivity
from reporting.schema.report_activity_data import ReportActivityDataIn
from reporting.service.report_activity_save_service import ReportActivitySaveLoadService
from .router import router


@router.post("reports/{report_version_id}/facilities/{facility_id}/activity/{activity_id}/report-activity")
@handle_http_errors()
def save_activity_data(
    request: HttpRequest,
    report_version_id: int,
    facility_id: UUID,
    activity_id: int,
    payload: ReportActivityDataIn,
):

    print(report_version_id, facility_id, activity_id)
    print(payload)

    service = ReportActivitySaveLoadService(report_version_id, facility_id, activity_id, request.current_user.user_guid)

    r: ReportActivity = service.save(payload.activity_data)

    return 200
