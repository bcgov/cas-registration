from common.permissions import authorize
from common.service.error_service.custom_codes_4xx import custom_codes_4xx
from django.http import HttpRequest
from registration.schema import Message
from reporting.service.form_builder_service import FormBuilderService

from .router import router

##### GET #####


@router.get(
    "/build-form-schema",
    response={200: str, custom_codes_4xx: Message},
    auth=authorize("approved_authorized_roles"),
)
def build_form_schema(
    request: HttpRequest, activity: int, report_version_id: int, facility_id: str
) -> tuple[int, str]:
    return 200, FormBuilderService.build_form_schema(
        activity, report_version_id, request.GET.getlist("source_types[]"), facility_id
    )
