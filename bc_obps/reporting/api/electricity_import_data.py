from typing import Literal
from django.http import HttpRequest
from reporting.constants import EMISSIONS_REPORT_TAGS
from service.error_service.custom_codes_4xx import custom_codes_4xx
from reporting.schema.generic import Message
from .router import router
from reporting.api.permissions import approved_industry_user_report_version_composite_auth
from ..models import ElectricityImportData
from ..schema.electricity_import_data import ElectricityImportDataIn, ElectricityImportDataOut
from ..service.electricity_import_data_service import ElectricityImportDataService, ElectricityImportFormData


@router.post(
    "report-version/{version_id}/electricity-import-data",
    response={200: int, custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="""Saves the data for the production data page into multiple ReportProduct rows""",
    auth=approved_industry_user_report_version_composite_auth,
)
def save_electricity_import_data(
    request: HttpRequest,
    version_id: int,
    payload: ElectricityImportDataIn,
) -> Literal[200]:
    payload_data = ElectricityImportFormData(**payload.dict())

    ElectricityImportDataService.save_electricity_import_data(version_id, payload_data)
    return 200


@router.get(
    "report-version/{version_id}/electricity-import-data",
    response={200: ElectricityImportDataOut, 404: Message, 400: Message, 500: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="""Takes `version_id` (primary key of the ReportVersion model) and `facility_id` to return a single matching `facility_report` object.
    Includes the associated activity IDs if found; otherwise, returns an error message if not found or in case of other issues.""",
    auth=approved_industry_user_report_version_composite_auth,
)
def get_electricity_import_data(
    request: HttpRequest, version_id: int
) -> tuple[Literal[200], ElectricityImportData | None]:
    electricity_import_data = ElectricityImportDataService.get_electricity_import_data(version_id)
    return 200, electricity_import_data
