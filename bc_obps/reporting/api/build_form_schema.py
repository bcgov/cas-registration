from service.error_service.custom_codes_4xx import custom_codes_4xx
from service.form_builder_service import FormBuilderService
from common.permissions import authorize
from .router import router
from django.http import HttpRequest
from typing import Tuple
from registration.schema import Message

##### GET #####


@router.get(
    "/build-form-schema",
    response={200: str, custom_codes_4xx: Message},
    auth=authorize("approved_authorized_roles"),
)
def build_form_schema(
    request: HttpRequest,
    activity: int,
    report_version_id: int,
) -> Tuple[int, str]:
    return 200, FormBuilderService.build_form_schema(activity, report_version_id, request.GET.getlist('source_types[]'))
