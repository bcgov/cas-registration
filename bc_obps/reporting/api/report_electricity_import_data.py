from typing import Literal, Optional
from django.http import HttpRequest
from reporting.constants import EMISSIONS_REPORT_TAGS
from service.error_service.custom_codes_4xx import custom_codes_4xx
from reporting.schema.generic import Message
from .router import router
from reporting.api.permissions import approved_industry_user_report_version_composite_auth
from ..models import ReportElectricityImportData
from ..schema.report_electricity_import_data import ElectricityImportDataSchema
from ..service.report_electricity_import_data_service import ElectricityImportDataService, ElectricityImportFormData


@router.post(
    "report-version/{version_id}/electricity-import-data",
    response={200: int, custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="""Saves electricity import data for the specified report version.
    The data is validated and stored in the database.""",
    auth=approved_industry_user_report_version_composite_auth,
)
def save_electricity_import_data(
    request: HttpRequest,
    version_id: int,
    payload: ElectricityImportDataSchema,
) -> Literal[200]:
    payload_data = ElectricityImportFormData(**payload.dict())

    ElectricityImportDataService.save_electricity_import_data(version_id, payload_data)
    return 200


@router.get(
    "report-version/{version_id}/electricity-import-data",
    response={200: Optional[ElectricityImportDataSchema], 404: Message, 400: Message, 500: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="""Retrieves electricity import data for the specified report version""",
    auth=approved_industry_user_report_version_composite_auth,
)
def get_electricity_import_data(
    request: HttpRequest, version_id: int
) -> tuple[Literal[200], ReportElectricityImportData | None]:
    electricity_import_data = ElectricityImportDataService.get_electricity_import_data(version_id)
    return 200, electricity_import_data
