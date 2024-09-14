import pprint
from django.http import HttpRequest
from django.db import transaction
from registration.decorators import handle_http_errors
from reporting.schema.report_activity_data import ReportActivityDataIn
from .router import router


@router.post("report/{report_version}/facility/{facility_id}/report-activity")
@handle_http_errors()
@transaction.atomic()
def save_activity_data(request: HttpRequest, payload: ReportActivityDataIn):

    pprint.pprint(payload, None, 2)

    return 200
