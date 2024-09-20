import json
from django.http import HttpRequest
from django.db import transaction
from registration.decorators import handle_http_errors
from reporting.schema.report_activity_data import ReportActivityDataIn
from .router import router


@router.post("reports/{report_version_id}/facilities/{facility_id}/activity/{activity_id}/report-activity")
@handle_http_errors()
@transaction.atomic()
def save_activity_data(
    request: HttpRequest,
    report_version_id: int,
    facility_id: int,
    activity_id: int,
    payload: ReportActivityDataIn,
):
    print(report_version_id, facility_id, activity_id)
    print(payload)

    return 200
