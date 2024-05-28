import json
from typing import List
from service.report_config_service import ReportConfigService
from .api_base import router
from reporting.schema import (
    ConfigOut,
)
from django.http import JsonResponse


from ninja.responses import codes_4xx
from ninja import Query


##### GET #####

@router.get("/get-config", response={200: str}, url_name="get_config")

def get_config_elements(request):
    return 200, ReportConfigService.build_config_elements()

@router.get("/get-gas-types", response={200: List[str]}, url_name="get_gas_types")
def get_valid_gas_types(request, activity: int, source_type: int):
    return 200, ReportConfigService.get_valid_gas_types(activity, source_type)

@router.get("/get-methodologies", response={200: List[str]}, url_name="get_methodologies")
def get_valid_methodologies(request, activity: int, source_type: int, gas_type: int):
    return 200, ReportConfigService.get_valid_methodologies(activity, source_type, gas_type)

@router.get("/get-methodology-fields", response={200: str}, url_name="get_methodologyFields")
def get_valid_methodologies(request, activity: int, source_type: int, gas_type: int, methodology: int):
    return 200, ReportConfigService.get_config_fields(activity, source_type, gas_type, methodology)
