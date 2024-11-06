from service.form_builder_service import FormBuilderService
from common.permissions import authorize
from .router import router
from registration.decorators import handle_http_errors
from django.http import HttpRequest
from typing import Tuple

from registration.schema.generic import Message
from ninja.responses import codes_4xx, codes_5xx

##### GET #####


@router.get(
    "/build-form-schema",
    response={200: str, codes_4xx: Message, codes_5xx: Message},
    auth=authorize("approved_authorized_roles"),
)
@handle_http_errors()
def build_form_schema(
    request: HttpRequest,
    activity: int,
    report_version_id: int,
) -> Tuple[int, str]:
    return 200, FormBuilderService.build_form_schema(activity, report_version_id, request.GET.getlist('source_types[]'))
