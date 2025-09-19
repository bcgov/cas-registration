from typing import Literal
from uuid import UUID
from common.permissions import authorize

from django.http import HttpRequest
from service.error_service.custom_codes_4xx import custom_codes_4xx
from reporting.constants import EMISSIONS_REPORT_TAGS
from reporting.schema.generic import Message
from service.report_version_service import ReportVersionService
from ..models import (
    ReportVersion,
    FacilityReport,
)
from ..schema.report_final_review import FacilityReportSchema, FinalReviewVersionSchema
from .router import router


@router.get(
    "/report-version/{version_id}/final-review",
    response={200: FinalReviewVersionSchema, custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="Fetch final review data for a given report version ID.",
    auth=authorize("approved_authorized_roles"),
)
def get_report_final_review_data(request: HttpRequest, version_id: int) -> tuple[Literal[200], ReportVersion]:
    # Fetch the report version data
    report_version = ReportVersionService.fetch_full_report_version(version_id, prefetch_full_facility_report=False)
    return 200, report_version


@router.get(
    "/report-version/{version_id}/final-review/{facility_id}/facility-reports",
    response={200: FacilityReportSchema, custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="Fetch only the facility_report data for the given report version and facility id (final review format).",
    auth=authorize("approved_authorized_roles"),
)
def get_report_version_facility_report(request: HttpRequest, version_id: int, facility_id: str) -> FacilityReport:
    """
    Returns the facility_report data for the given report version and facility id, in the same format as the final review API.
    """
    facility_uuid = UUID(facility_id)
    return FacilityReport.objects.get(report_version_id=version_id, facility=facility_uuid)
