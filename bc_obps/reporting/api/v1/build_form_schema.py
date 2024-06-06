from service.form_builder_service import FormBuilderService
from ..router import router

from ninja.responses import codes_4xx

##### GET #####

@router.get("/build-form-schema", response={200: str}, url_name="build_form_schema")
def build_form_schema(request, activity: int=None, source_type: int=None, gas_type: int=None, methodology: int=None):
    return 200, FormBuilderService.build_form_schema(activity, source_type, gas_type, methodology)
