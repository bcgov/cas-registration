from typing import List
from service.report_config_service import ReportConfigService
from .api_base import router
from reporting.schema import (
    ConfigOut,
)


from ninja.responses import codes_4xx
from ninja import Query


##### GET #####

@router.get("/get-config", response={200: str}, url_name="get_config")

def get_config_elements(request):
    return 200, ReportConfigService.build_config_elements()
