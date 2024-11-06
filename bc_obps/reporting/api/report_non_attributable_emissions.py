from typing import Literal, Tuple, List
from uuid import UUID

from django.http import HttpRequest

from common.permissions import authorize
from registration.decorators import handle_http_errors
from reporting.constants import EMISSIONS_REPORT_TAGS
from reporting.schema.generic import Message
from service.error_service.custom_codes_4xx import custom_codes_4xx

from .router import router
from ..models import ReportNonAttributableEmissions
from ..schema.report_non_attributable_emissions import ReportNonAttributableOut, ReportNonAttributableIn
from ..service.report_non_attributable_service import ReportNonAttributableService


@router.get(
    "/report-version/{version_id}/facilities/{facility_id}/non-attributable",
    response={200: List[ReportNonAttributableOut], custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="""Takes version_id (primary key of Report_Version model) and returns all non-attributable emissions for that report version.""",
    auth=authorize("approved_industry_user"),
)
@handle_http_errors()
def get_report_non_attributable_by_version_id(
    request: HttpRequest, version_id: int, facility_id: UUID
) -> tuple[Literal[200], list[ReportNonAttributableEmissions]]:
    emissions = ReportNonAttributableService.get_report_non_attributable_by_version_id(
        version_id, facility_id=facility_id
    )
    return 200, emissions


@router.post(
    "/report-version/{version_id}/facilities/{facility_id}/non-attributable",
    response={201: List[ReportNonAttributableOut], custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="""Updates given report operation with fields: Operator Legal Name, Operator Trade Name, Operation Name, Operation Type,
    Operation BC GHG ID, BC OBPS Regulated Operation ID, Operation Representative Name, and Activities.""",
    auth=authorize("approved_industry_user"),
)
@handle_http_errors()
def save_report(
    request: HttpRequest, version_id: int, facility_id: UUID, payload: List[ReportNonAttributableIn]
) -> Tuple[Literal[201], List[ReportNonAttributableOut]]:
    saved_reports = []
    for data in payload:
        report_operation = ReportNonAttributableService.save_report_non_attributable_emissions(
            version_id, facility_id, data
        )
        saved_reports.append(report_operation)
    return 201, saved_reports  # type: ignore
