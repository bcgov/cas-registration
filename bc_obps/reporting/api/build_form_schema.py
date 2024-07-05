from service.form_builder_service import FormBuilderService
from .router import router
from registration.decorators import handle_http_errors

from registration.schema.generic import Message
from ninja.responses import codes_4xx, codes_5xx

##### GET #####


@router.get(
    "/build-form-schema", response={200: str, codes_4xx: Message, codes_5xx: Message}, url_name="build_form_schema"
)
@handle_http_errors()
def build_form_schema(
    request,
    activity: int = None,
    source_type: int = None,
    gas_type: int = None,
    methodology: int = None,
    report_date: str = '2024-04-01',
):
    return 200, FormBuilderService.build_form_schema(activity, source_type, gas_type, methodology, report_date)
