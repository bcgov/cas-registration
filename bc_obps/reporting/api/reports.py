from typing import Literal, Tuple, Optional
from uuid import UUID
from django.http import HttpRequest
from registration.decorators import handle_http_errors
from reporting.constants import EMISSIONS_REPORT_TAGS
from reporting.schema.generic import Message
from reporting.schema.report import StartReportIn
from service.report_service import ReportService
from service.reporting_year_service import ReportingYearService
from service.error_service.custom_codes_4xx import custom_codes_4xx
from reporting.schema.report_operation import ReportOperationOut, ReportOperationIn
from reporting.schema.reporting_year import ReportingYearOut
from .router import router
from ..models import ReportingYear
from ..schema.facility_report import FacilityReportOut, FacilityReportIn


@router.post(
    "/create-report",
    response={201: int, custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="""Starts a report for a given operation and reporting year, by creating the underlying data structures and
    pre-populating them with facility, operation and operator information. Returns the id of the report that was created.
    This endpoint only allows the creation of a report for an operation / operator to which the current user has access.""",
)
@handle_http_errors()
def start_report(request: HttpRequest, payload: StartReportIn) -> Tuple[Literal[201], int]:
    report_version_id = ReportService.create_report(payload.operation_id, payload.reporting_year)
    return 201, report_version_id


@router.get(
    "/report-version/{version_id}/report-operation",
    response={200: ReportOperationOut, custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="""Takes version_id (primary key of Report_Version model) and returns its report_operation object.""",
)
@handle_http_errors()
def get_report_operation_by_version_id(
    request: HttpRequest, version_id: int
) -> Tuple[Literal[200], ReportOperationOut]:
    report_operation = ReportService.get_report_operation_by_version_id(version_id)
    return 200, report_operation  # type: ignore


@router.post(
    "/report-version/{version_id}/report-operation",
    response={201: ReportOperationOut, custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="""Updates given report operation with fields: Operator Legal Name, Operator Trade Name, Operation Name, Operation Type,
    Operation BC GHG ID, BC OBPS Regulated Operation ID, Operation Representative Name, and Activities.""",
)
@handle_http_errors()
def save_report(
    request: HttpRequest, version_id: int, payload: ReportOperationIn
) -> Tuple[Literal[201], ReportOperationOut]:
    report_operation = ReportService.save_report_operation(version_id, payload)
    return 201, report_operation  # type: ignore


@router.get(
    "/reporting-year",
    response={200: ReportingYearOut, custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="""Returns json object with current reporting year and due date.""",
)
@handle_http_errors()
def get_reporting_year(request: HttpRequest) -> Tuple[Literal[200], ReportingYear]:
    return 200, ReportingYearService.get_current_reporting_year()


@router.get(
    "/report-version/{version_id}/facility-report/{facility_id}",
    response={200: FacilityReportOut, 404: Message, 400: Message, 500: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="""Takes `version_id` (primary key of the ReportVersion model) and `facility_id` to return a single matching `facility_report` object.
    Includes the associated activity IDs if found; otherwise, returns an error message if not found or in case of other issues.""",
)
@handle_http_errors()
def get_facility_report_form_data(
    request: HttpRequest, version_id: int, facility_id: UUID
) -> Tuple[Literal[200], Optional[FacilityReportOut]]:
    facility_report = ReportService.get_facility_report_by_version_and_id(version_id, facility_id)
    activity_ids = ReportService.get_activity_ids_for_facility(version_id, facility_id) or []
    return 200, ReportService.get_facility_report_form_data(facility_report, activity_ids)


@router.post(
    "/report-version/{version_id}/facility-report/{facility_id}",
    response={201: FacilityReportOut, custom_codes_4xx: Message},
    tags=EMISSIONS_REPORT_TAGS,
    description="""Updates the report facility details by version_id and facility_id. The request body should include
    fields to be updated, such as facility name, type, BC GHG ID, activities, and products. Returns the updated report
    facility object or an error message if the update fails.""",
)
@handle_http_errors()
def save_facility_report(
    request: HttpRequest, version_id: int, facility_id: UUID, payload: FacilityReportIn
) -> Tuple[Literal[201], FacilityReportOut]:
    """
    Save or update a report facility and its related activities.

    Args:
        request (HttpRequest): The HTTP request object.
        version_id (int): The ID of the report version.
        facility_id (int): The ID of the facility.
        payload (FacilityReportIn): The input data for the report facility.

    Returns:
        Tuple: HTTP status code and the response data or an error message.
    """
    # Fetch the existing facility report or create a new one
    facility_report = ReportService.save_facility_report(version_id, facility_id, payload)

    # Prepare the response data
    response_data = FacilityReportOut(
        id=facility_id,
        report_version_id=facility_report.report_version.id,
        facility_name=facility_report.facility_name,
        facility_type=facility_report.facility_type,
        facility_bcghgid=facility_report.facility_bcghgid,
        activities=list(facility_report.activities.values_list('id', flat=True)),
        products=list(facility_report.products.values_list('id', flat=True)) or [],
    )
    return 201, response_data
