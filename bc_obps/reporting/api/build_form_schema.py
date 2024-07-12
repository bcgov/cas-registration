from service.form_builder_service import FormBuilderService
from .router import router
from registration.decorators import handle_http_errors
from django.http import HttpResponse, HttpRequest
from typing import Tuple

from registration.schema.generic import Message
from ninja.responses import codes_4xx, codes_5xx

##### GET #####


@router.get(
    "/build-form-schema", response={200: str, codes_4xx: Message, codes_5xx: Message}, url_name="build_form_schema"
)
@handle_http_errors()
def build_form_schema(
    request: HttpRequest,
    activity: int,
    report_date: str,
) -> Tuple[int, str]:
    return 200, FormBuilderService.build_form_schema(activity, report_date, request.GET.getlist('source_types[]'))
