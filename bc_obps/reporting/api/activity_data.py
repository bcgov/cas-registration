from service.activity_service import ActivityService
from .router import router
from registration.decorators import handle_http_errors
from django.http import HttpRequest
from typing import Tuple

from registration.schema.generic import Message
from ninja.responses import codes_4xx, codes_5xx

##### GET #####


@router.get(
    "/get_activity_data", response={200: str, codes_4xx: Message, codes_5xx: Message}, url_name="get_activity_data"
)
@handle_http_errors()
def get_activity_data(
    request: HttpRequest,
    activity_name: str,
    report_date: str,
) -> Tuple[int, str]:
    print(activity_name)
    return 200, ActivityService.get_activity_data(activity_name, report_date)
