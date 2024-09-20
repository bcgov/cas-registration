from pprint import pprint
from uuid import UUID
from django.http import HttpRequest
from registration.decorators import handle_http_errors
from reporting.models.report_activity import ReportActivity
from reporting.schema.report_activity_data import ReportActivityDataIn
from reporting.service.report_activity_save_load_service import ReportActivitySaveLoadService
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

    r: ReportActivity = ReportActivitySaveLoadService.save(
        report_version_id, facility_id, activity_id, payload.activity_data
    )

    pprint(r.values())

    return 200
