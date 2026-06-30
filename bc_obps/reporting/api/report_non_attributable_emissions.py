from typing import List
from uuid import UUID
from django.http import HttpRequest
from ninja import Status
from reporting.constants import EMISSIONS_REPORT_TAGS
from reporting.schema.generic import Message
from service.error_service.custom_codes_4xx import custom_codes_4xx
from .router import router
from ..schema.report_non_attributable_emissions import (
    ReportNonAttributableOut,
    ReportNonAttributableActivityOut,
    ReportNonAttributableSchema,
)
from ..service.report_non_attributable_service import ReportNonAttributableService
from reporting.api.permissions import approved_industry_user_report_version_composite_auth


@router.get(
    "/report-version/{version_id}/facilities/{facility_id}/non-attributable",
    response={200: ReportNonAttributableOut, custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="""Takes version_id (primary key of Report_Version model) and returns all non-attributable emissions for that report version.""",
    auth=approved_industry_user_report_version_composite_auth,
)
def get_report_non_attributable_by_version_id(request: HttpRequest, version_id: int, facility_id: UUID) -> Status:
    emissions = ReportNonAttributableService.get_report_non_attributable_by_version_id(
        version_id, facility_id=facility_id
    )
    return Status(200, {"emissions_exceeded": emissions.exists(), "activities": emissions})


@router.post(
    "/report-version/{version_id}/facilities/{facility_id}/non-attributable",
    response={201: List[ReportNonAttributableActivityOut], custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="""Handles updating or deleting non-attributable emissions data for a specified facility and report
    version. If `emissions_exceeded` is `false`, all existing non-attributable emissions data is deleted for the
    specified version and facility. If `emissions_exceeded` is `true`, the provided non-attributable emissions data
    is saved.""",
    auth=approved_industry_user_report_version_composite_auth,
)
def save_report(
    request: HttpRequest, version_id: int, facility_id: UUID, payload: ReportNonAttributableSchema
) -> Status:
    saved_reports = []

    # If emissions_exceeded is false, delete existing data
    if not payload.emissions_exceeded:
        ReportNonAttributableService.delete_existing_reports(version_id, facility_id)

    else:
        saved_reports = ReportNonAttributableService.save_report_non_attributable_emissions(
            version_id, facility_id, payload.activities
        )

    return Status(201, saved_reports)
