from typing import Tuple


from common.permissions import authorize
from registration.models import Operation
from reporting.constants import EMISSIONS_REPORT_TAGS
from .router import router
from ..schema.report_history import ReportOperationResponse
from ..models import Report
from django.http import HttpRequest
from reporting.schema.generic import Message
from service.error_service.custom_codes_4xx import custom_codes_4xx


@router.get(
    "/reports/{report_id}/operation",
    response={200: ReportOperationResponse, custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="""Returns the operation details given report.""",
    auth=authorize("approved_authorized_roles"),
)
def get_report_operation(request: HttpRequest, report_id: int) -> Tuple[int, Operation]:
    operation = Report.objects.select_related('operation').get(id=report_id).operation
    return 200, operation
