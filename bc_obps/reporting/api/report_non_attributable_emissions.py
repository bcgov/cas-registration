from typing import Literal, Tuple

from django.http import HttpRequest

from common.permissions import authorize
from registration.decorators import handle_http_errors
from reporting.constants import EMISSIONS_REPORT_TAGS
from reporting.schema.generic import Message
from service.error_service.custom_codes_4xx import custom_codes_4xx

from .router import router
from ..schema.report_non_attributable_emissions import ReportNonAttributableOut, ReportNonAttributableIn
from ..service.report_non_attributable_service import ReportNonAttributableService


@router.get(
    "/report-version/{version_id}/facilities/{facility_id}/non-attributable",
    response={200: ReportNonAttributableOut, custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="""Takes version_id (primary key of Report_Version model) and returns its report_operation object.""",
    auth=authorize("approved_authorized_roles"),
)
@handle_http_errors()
def get_report_operation_by_version_id(
    request: HttpRequest, version_id: int
) -> Tuple[Literal[200], ReportNonAttributableOut]:
    report_operation = ReportNonAttributableService.get_report_non_attributable_by_version_id(version_id)
    return 200, report_operation  # type: ignore


@router.post(
    "/report-version/{version_id}/facilities/{facility_id}/non-attributable",
    response={201: ReportNonAttributableOut, custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="""Updates given report operation with fields: Operator Legal Name, Operator Trade Name, Operation Name, Operation Type,
    Operation BC GHG ID, BC OBPS Regulated Operation ID, Operation Representative Name, and Activities.""",
    auth=authorize("approved_industry_user"),
)
@handle_http_errors()
def save_report(
    request: HttpRequest, version_id: int, payload: ReportNonAttributableIn
) -> Tuple[Literal[201], ReportNonAttributableOut]:
    report_operation = ReportNonAttributableService.save_report_non_attributable_emissions(version_id, payload)
    return 201, report_operation  # type: ignore
