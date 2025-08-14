from typing import Literal

from django.http import HttpRequest
from service.error_service.custom_codes_4xx import custom_codes_4xx
from reporting.constants import EMISSIONS_REPORT_TAGS
from reporting.schema.generic import Message
from service.report_version_service import ReportVersionService
from .permissions import approved_industry_user_report_version_composite_auth
from ..models import (
    ReportVersion,
)
from ..schema.report_final_review import ReportVersionSchema
from .router import router


@router.get(
    "/report-version/{version_id}/final-review",
    response={200: ReportVersionSchema, custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="Fetch final review data for a given report version ID.",
    auth=approved_industry_user_report_version_composite_auth,
)
def get_report_final_review_data(request: HttpRequest, version_id: int) -> tuple[Literal[200], ReportVersion]:
    # Fetch the report version data
    report_version = ReportVersionService.fetch_full_report_version(version_id)
    return 200, report_version
