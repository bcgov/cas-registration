from typing import Literal
from uuid import UUID

from common.api.utils import get_current_user_guid
from common.service.error_service.custom_codes_4xx import custom_codes_4xx
from django.http import HttpRequest
from reporting.api.permissions import (
    approved_industry_user_report_version_composite_auth,
)
from reporting.constants import EMISSIONS_REPORT_TAGS
from reporting.schema.generic import Message
from reporting.schema.report_product import ReportProductSchemaIn
from reporting.service.report_product_service import ReportProductService

from .router import router


@router.post(
    "report-version/{version_id}/facilities/{facility_id}/production-data",
    response={200: int, custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="""Saves the data for the production data page into multiple ReportProduct rows""",
    auth=approved_industry_user_report_version_composite_auth,
)
def save_production_data(
    request: HttpRequest,
    version_id: int,
    facility_id: UUID,
    payload: list[ReportProductSchemaIn],
) -> Literal[200]:
    product_data_dicts = [item.dict() for item in payload]

    ReportProductService.save_production_data(
        version_id, facility_id, product_data_dicts, get_current_user_guid(request)
    )

    return 200
